import { Kernel, interfaces } from 'inversify';

import {Engine} from './engine';
import {V8Engine} from './v8-engine';
import {Vehicle} from './vehicle';
import {RearLeftWheel, RearRightWheel, FrontLeftWheel, FrontRightWheel} from './wheel';


var kernel = new Kernel();

kernel.bind<IVehicle>("vehicle").to(Vehicle);
kernel.bind<IEngine>("engine").to(V8Engine);


[RearLeftWheel, RearRightWheel, FrontLeftWheel, FrontRightWheel].forEach((constr: interfaces.Newable<IWheel>)=>{
	kernel.bind<IWheel>("wheels").to(constr);
});



export default kernel;