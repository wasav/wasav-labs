
import {injectable, inject} from "inversify";

@injectable()
export class V8Engine implements IEngine {
	
	public start(): void{
		console.log("Starting V8 Engine");
	}
	
	public stop(): void{
		// ...
	}
	
}