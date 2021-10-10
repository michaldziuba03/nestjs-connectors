import { DynamicModule, Global, Logger, Module, Provider } from "@nestjs/common";
import { DseClientOptions, Client } from 'cassandra-driver';
import { CassandraModuleAsyncOptions } from "./cassandra.interface";

export const CASSANDRA_CLIENT = 'CASSANDRA_CLIENT';

function createProvider(client: Client): Provider {
    return {
        provide: CASSANDRA_CLIENT,
        useValue: client,

    }
}

function createAsyncProvider(moduleOptions: CassandraModuleAsyncOptions): Provider {
    return {
        provide: CASSANDRA_CLIENT,
        inject: moduleOptions.inject,
        useFactory: (...args: any[]) => {
            const redisOptions = moduleOptions.useFactory(args);
            const client = new Client(redisOptions);
            client.connect()
                .then(() => {
                    Logger.log('Cassandra connected successfuly', 'CassandraModule');
                });
            
            return client;
        }
    }
}

@Global()
@Module({})
export class CassandraModule {
    static register(options: DseClientOptions): DynamicModule {
        const client = new Client(options);
        client
            .connect()
            .then(() => {
                Logger.log('Cassandra connected successfuly', 'CassandraModule');
            });
        
        const providers = [createProvider(client)];

        return {
            module: CassandraModule,
            providers,
            exports: providers,
        }
    }

    static registerAsync(options: CassandraModuleAsyncOptions): DynamicModule {
        const providers = [createAsyncProvider(options)];

        return {
            module: CassandraModule,
            imports: options.imports,
            providers,
        }
    }
}