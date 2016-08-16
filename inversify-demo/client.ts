
import kernel from './dependencies-loader';
import "reflect-metadata";

var car: IVehicle = kernel.get<IVehicle>("vehicle");

car.checkWheels();
car.startEngine();
