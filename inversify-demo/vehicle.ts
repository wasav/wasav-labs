
import {injectable, inject, multiInject} from "inversify";


@injectable()
export class Vehicle implements IVehicle{
	
	constructor(@inject("engine") private engine: IEngine,
				@multiInject("wheels") private wheels: IWheel[]){
	}
	
	public startEngine(): void{
		this.engine.start();
	}
	
	public checkWheels(): void{
		if(Array.isArray(this.wheels)){
			this.wheels.forEach((wheel: IWheel, index: number) => {
				console.log("Checking wheel " + index);
				wheel.isTireFlat();
			});
		}
	}
}