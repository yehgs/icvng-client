import ServiceBookingPage from "./ServiceBookingPage";
import { SERVICES } from "../config/bookingServices";

const RentCoffeeMachine = () => <ServiceBookingPage service={SERVICES.rental} />;
export default RentCoffeeMachine;
