import {injectable } from 'inversify';

// Annotation mandatory for base class
@injectable()
class Wheel implements IWheel {

	public isTireFlat(): boolean{
		console.log("Checking if I am flat ...");
		return false;
	}
	
}


@injectable()
export class RearLeftWheel extends Wheel{
	// ...
}

@injectable()
export class RearRightWheel extends Wheel{
	// ...
}

@injectable()
export class FrontLeftWheel extends Wheel{
	// ...
}

@injectable()
export class FrontRightWheel extends Wheel{
	// ...
}