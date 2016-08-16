
import {injectable, inject} from "inversify";

@injectable()
export class Engine implements IEngine {
	
	public start(): void{
		console.log("Starting Engine");
	}
	
	public stop(): void{
		// ...
	}
	
}