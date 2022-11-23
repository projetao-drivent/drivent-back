import { prisma } from "@/config";

async function findHotels() {
  return prisma;
}

const hotelRepository = {
  findHotels,    
};
  
export default hotelRepository;

