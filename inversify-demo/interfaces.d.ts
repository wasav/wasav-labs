
interface IWheel{

	isTireFlat(): boolean;

}

interface IVehicle{
	startEngine(): void;
	checkWheels(): void;
}

interface IEngine{
	start(): void;
	stop(): void;
}