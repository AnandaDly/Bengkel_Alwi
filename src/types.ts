export type VehicleType = 'motor' | 'mobil';
export type Role = 'user' | 'mitra';
export interface Account { id: string; name: string; role: Role }
export interface Vehicle { id: string; userId: string; type: VehicleType; model: string; plate: string }
export interface Service { id: string; name: string; price: number }
export interface Workshop {
  id: string; ownerId: string; name: string; area: string; address: string;
  lat: number; lng: number; vehicles: VehicleType[]; description: string;
  open: string; close: string; slots: string[]; capacity: number;
  services: Service[]; rating: number; reviews: number; color: string;
}
export interface Product { id: string; workshopId: string; name: string; price: number; stock: number; vehicle: VehicleType; compatibility: string; description: string; category: string }
export interface Answer { id: string; authorId: string; workshopId?: string; text: string; createdAt: string }
export interface Question { id: string; userId: string; workshopId?: string; title: string; body: string; vehicle: VehicleType; model: string; category: string; resolved: boolean; createdAt: string; answers: Answer[] }
export type BookingStatus = 'menunggu' | 'diterima' | 'dikerjakan' | 'selesai' | 'ditolak';
export interface Booking { id: string; userId: string; workshopId: string; vehicleId: string; serviceId: string; serviceName: string; price: number; date: string; slot: string; complaint: string; status: BookingStatus; createdAt: string }
export interface CartItem { productId: string; quantity: number }
export type OrderStatus = 'menunggu_pembayaran' | 'pembayaran_gagal' | 'dibayar' | 'disiapkan' | 'siap_diambil' | 'selesai';
export interface OrderItem { productId: string; name: string; price: number; quantity: number }
export interface Order { id: string; userId: string; workshopId: string; items: OrderItem[]; total: number; status: OrderStatus; stockApplied: boolean; createdAt: string }
export interface Database { version: 1; activeAccountId: string; accounts: Account[]; vehicles: Vehicle[]; workshops: Workshop[]; products: Product[]; questions: Question[]; bookings: Booking[]; orders: Order[]; carts: Record<string, CartItem[]> }
export interface Filters { query: string; vehicle: string; service: string; openOnly: boolean; radius: number }
