// eslint-disable-next-line @typescript-eslint/naming-convention
export interface ServerMethods {
	registerUser: (...args: any[]) => any;
	resetPassword: (...args: any[]) => any;
	saveCannedResponse: (...args: any[]) => any;
	saveUserProfile: (...args: any[]) => any;
	sendConfirmationEmail(to: string): boolean;
	setAvatarFromService: (...args: any[]) => any;
	setUserPassword(password: string): void;
	unmuteUserInRoom: (...args: any[]) => any;
	unreadMessages: (...args: any[]) => any;
	updateIncomingIntegration: (...args: any[]) => any;
	updateOutgoingIntegration: (...args: any[]) => any;
	'checkRegistrationSecretURL'(hash: string): boolean;
}

export type ServerMethodName = keyof ServerMethods;

export type ServerMethodParameters<MethodName extends ServerMethodName> = Parameters<ServerMethods[MethodName]>;

export type ServerMethodReturn<MethodName extends ServerMethodName> = Awaited<ReturnType<ServerMethods[MethodName]>>;

export type ServerMethodFunction<MethodName extends ServerMethodName> = (
	...args: ServerMethodParameters<MethodName>
) => Promise<ServerMethodReturn<MethodName>>;
