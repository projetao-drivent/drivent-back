import app, { init } from "@/app";
import faker from "@faker-js/faker";
import { TicketStatus } from "@prisma/client";
import httpStatus from "http-status";
import { any } from "joi";
import * as jwt from "jsonwebtoken";
import supertest from "supertest";
import {
  createUser,
  createHotel,
  createHotelRoom,
  createSingleRoom,
  findBooking,
  createBooking,
  createEnrollmentWithAddress,
  createTicket,
  createTicketType,
  createTicketTypeRemote,
  createTicketTypeWithHotel
  
} from "../factories";
import { cleanDb, generateValidToken } from "../helpers";

const server = supertest(app);

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

describe("GET /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/booking");
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is invalid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no active session for the given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 404 if user has no booking", async () => {
      const token = await generateValidToken();

      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 200 and with booking and room data", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const hotelRoom = await createHotelRoom(hotel.id);
      const booking = await createBooking(user.id, hotelRoom.id);

      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual({
        id: booking.id,
        Room: {
          capacity: hotelRoom.capacity,
          createdAt: hotelRoom.createdAt.toISOString(),
          updatedAt: hotelRoom.updatedAt.toISOString(),
          hotelId: hotelRoom.hotelId,
          id: hotelRoom.id,
          name: hotelRoom.name,
        },
      });
    });
  });
});

describe("POST /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.post("/booking");
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  
  it("should respond with status 401 if given token is invalid", async () => {
    const token = faker.lorem.word();
  
    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  
  it("should respond with status 401 if there is no active session for the given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
  
    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  
  describe("when token is valid", () => {
    it("should respond with status 404 if roomId is not valid", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();
      const room = await createHotelRoom(hotel.id);
      const body = { roomId: faker.datatype.number() };
      await createBooking(user.id, room.id);
  
      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });
      
    it("should respond with status 403 if room is at max capacity", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();
      const room = await createSingleRoom(hotel.id);
      const body = { roomId: room.id };
      await createBooking(user.id, room.id);
  
      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });
      
    it("should respond with status 403 when user doesnt have an enrollment yet", async () => {
      const token = await generateValidToken();
      const body = { roomId: faker.datatype.number() };
          
      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 when user doesnt have a valid ticket", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      await createEnrollmentWithAddress(user);
      const body = { roomId: faker.datatype.number() };
          
      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 when ticket does not include hotel", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const body = { roomId: faker.datatype.number() };
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeRemote();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
          
      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 when ticket is not paid", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const body = { roomId: faker.datatype.number() };
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
          
      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });
      
    it("should respond with status 200 and booking data", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();
      const room = await createHotelRoom(hotel.id);
      const body = { roomId: room.id };
      await createBooking(user.id, room.id);
  
      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual({
        bookingId: expect.any(Number)
      });
      const createdBooking = await findBooking(response.body.bookingId);
      expect(createdBooking).toEqual({
        id: expect.any(Number),
        userId: expect.any(Number),
        roomId: expect.any(Number),
        createdAt: expect.any(Date), 
        updatedAt: expect.any(Date),
      });
    });
  });
});

describe("PUT /booking/:bookingId", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.put("/booking/0");
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  
  it("should respond with status 401 if given token is invalid", async () => {
    const token = faker.lorem.word();
  
    const response = await server.put("/booking/0").set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  
  it("should respond with status 401 if there is no active session for the given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
  
    const response = await server.put("/booking/0").set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 404 if roomId is not valid", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const room = await createHotelRoom(hotel.id);
      const body = { roomId: faker.datatype.number() };
      await createBooking(user.id, room.id);
    
      const response = await server.put("/booking/0").set("Authorization", `Bearer ${token}`).send(body);
      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });
        
    it("should respond with status 403 if room is at max capacity", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const formerRoom = await createHotelRoom(hotel.id);
      const newRoom = await createSingleRoom(hotel.id);
      const body = { roomId: newRoom.id };
      const booking = await createBooking(user.id, formerRoom.id);
      await createBooking(user.id, newRoom.id);
    
      const response = await server.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send(body);
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 when user doesnt have a booking yet", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const room = await createHotelRoom(hotel.id);
      const body = { roomId: room.id };
      await createBooking(user.id, room.id);
      
      const response = await server.put("/booking/0").set("Authorization", `Bearer ${token}`).send(body);
      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 200 and with booking data", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const formerRoom = await createHotelRoom(hotel.id);
      const newRoom = await createHotelRoom(hotel.id);
      const body = { roomId: newRoom.id };
      const booking = await createBooking(user.id, formerRoom.id);
      
      const response = await server.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send(body);
      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual({
        updatedBookingId: booking.id,
      });
      
      const createdBooking = await findBooking(response.body.bookingId);
      expect(createdBooking).toEqual({
        id: booking.id,
        userId: user.id,
        roomId: newRoom.id,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });
  });
});
