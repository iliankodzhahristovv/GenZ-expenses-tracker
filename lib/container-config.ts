import "reflect-metadata";
import { Container } from "inversify";

// Import your modules here
import { AuthModule } from "@/modules/auth/auth.module";
import { UserModule } from "@/modules/users/user.module";
import { ChatModule } from "@/modules/chat/chat.module";

const container = new Container();

// Register your modules here
// Note: Register Auth module before User module since User may depend on Auth
AuthModule.register(container);
UserModule.register(container);
ChatModule.register(container);

export { container };

