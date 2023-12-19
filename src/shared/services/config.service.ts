import * as dotenv from 'dotenv';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import { ISwaggerConfigInterface } from 'src/interfaces';

export class ConfigService {
  constructor() {
    dotenv.config({
      path: `.env`,
    });

    // Replace \\n with \n to support multiline strings in AWS
    for (const envName of Object.keys(process.env)) {
      process.env[envName] = process.env[envName].replace(/\\n/g, '\n');
    }
    if (this.nodeEnv === 'development') {
      console.info(process.env);
    }
  }

  public get(key: string): string {
    return process.env[key];
  }

  public getNumber(key: string): number {
    return Number(this.get(key));
  }

  get nodeEnv(): string {
    return this.get('NODE_ENV') || 'development';
  }

  get app() {
    return {
      env: this.nodeEnv,
      version: this.get('API_VERSION'),
      url: this.get('API_URL'),
      cors: this.get('CORS'),
      prefix: this.apiPrefix,
    };
  }

  get messaging() {
    return {
      url: this.get('EMR_API_URL'),
    };
  }

  get apiPrefix() {
    let prefix = this.get('API_PREFIX');
    if (!prefix) {
      prefix = '';
    }
    if (prefix == 'version') {
      prefix = this.get('API_VERSION');
    }
    return prefix;
  }

  get swaggerConfig(): ISwaggerConfigInterface {
    return {
      path: this.get('SWAGGER_PATH') || '/api/docs',
      title: this.get('SWAGGER_TITLE') || 'My API',
      description: this.get('SWAGGER_DESCRIPTION'),
      version: this.get('SWAGGER_VERSION') || '0.0.1',
      scheme: this.get('SWAGGER_SCHEME') === 'https' ? 'https' : 'http',
    };
  }

  get alya() {
    return {
      host: this.get('ALYA_HOST'),
      room: this.get('ALYA_ROOM'),
      secret: this.get('ALYA_SECRET'),
    };
  }

  get googleCloud() {
    return {
      projectId: this.get('GOOGLE_CLOUD_PROJECT_ID'),
      location: this.get('GOOGLE_CLOUD_LOCATION'),
      taskQueueName: this.get('GOOGLE_CLOUD_TASK_QUEUE_NAME'),
    };
  }

  // get typeOrmConfig(): TypeOrmModuleOptions {
  //   let entities = [__dirname + '/../../modules/**/*.entity{.ts,.js}'];
  //   let migrations = [__dirname + '/../../migrations/*{.ts,.js}'];

  //   if ((module as any).hot) {
  //     const entityContext = (require as any).context(
  //       './../../modules',
  //       true,
  //       /\.entity\.ts$/,
  //     );
  //     entities = entityContext.keys().map((id) => {
  //       const entityModule = entityContext(id);
  //       const [entity] = Object.values(entityModule);
  //       return entity;
  //     });
  //     const migrationContext = (require as any).context(
  //       './../../migrations',
  //       false,
  //       /\.ts$/,
  //     );
  //     migrations = migrationContext.keys().map((id) => {
  //       const migrationModule = migrationContext(id);
  //       const [migration] = Object.values(migrationModule);
  //       return migration;
  //     });
  //   }
  //   return {
  //     entities,
  //     migrations,
  //     keepConnectionAlive: true,
  //     type: 'mysql',
  //     host: this.get('MYSQL_HOST'),
  //     port: this.getNumber('MYSQL_PORT'),
  //     username: this.get('MYSQL_USERNAME'),
  //     password: this.get('MYSQL_PASSWORD'),
  //     database: this.get('MYSQL_DATABASE'),
  //     migrationsRun: true,
  //     logging: this.nodeEnv === 'development',
  //     namingStrategy: new SnakeNamingStrategy(),
  //     cache: {
  //       type: 'redis',
  //       options: {
  //         host: this.get('REDIS_HOST'),
  //         port: this.get('REDIS_PORT'),
  //         user: this.get('REDIS_USER'),
  //         password: this.get('REDIS_PASSWORD'),
  //         prefix: this.get('REDIS_PREFIX'),
  //       },
  //       duration: 60000,
  //     },
  //   };
  // }

  get eventStoreConfig() {
    return {
      protocol: this.get('EVENT_STORE_PROTOCOL') || 'http',
      connectionSettings: {
        defaultUserCredentials: {
          username: this.get('EVENT_STORE_CREDENTIALS_USERNAME') || 'admin',
          password: this.get('EVENT_STORE_CREDENTIALS_PASSWORD') || 'changeit',
        },
        verboseLogging: true,
        failOnNoServerResponse: true,
        // log: console, // TODO: improve Eventstore logger (separate chanel)
      },
      tcpEndpoint: {
        host: this.get('EVENT_STORE_HOSTNAME') || 'localhost',
        port: this.getNumber('EVENT_STORE_TCP_PORT') || 1113,
      },
      httpEndpoint: {
        host: this.get('EVENT_STORE_HOSTNAME') || 'localhost',
        port: this.getNumber('EVENT_STORE_HTTP_PORT') || 2113,
      },
      poolOptions: {
        min: this.getNumber('EVENT_STORE_POOLOPTIONS_MIN') || 1,
        max: this.getNumber('EVENT_STORE_POOLOPTIONS_MAX') || 10,
      },
    };
  }

  // get awsS3Config(): IAwsConfigInterface {
  //   return {
  //     accessKeyId: this.get('AWS_S3_ACCESS_KEY_ID'),
  //     secretAccessKey: this.get('AWS_S3_SECRET_ACCESS_KEY'),
  //     bucketName: this.get('S3_BUCKET_NAME'),
  //   };
  // }

  get winstonConfig() {
    return {
      transports: [
        new DailyRotateFile({
          level: 'debug',
          filename: `./logs/${this.nodeEnv}/debug-%DATE%.log`,
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
        new DailyRotateFile({
          level: 'error',
          filename: `./logs/${this.nodeEnv}/error-%DATE%.log`,
          datePattern: 'YYYY-MM-DD',
          zippedArchive: false,
          maxSize: '20m',
          maxFiles: '30d',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
        new winston.transports.Console({
          level: 'debug',
          handleExceptions: true,
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp({
              format: 'DD-MM-YYYY HH:mm:ss',
            }),
            winston.format.simple(),
          ),
        }),
      ],
      exitOnError: false,
    };
  }

  get elastic() {
    return {
      apm: {
        enabled: this.get('ELASTIC_APM_ENABLED') == 'true',
        apiKey: this.get('ELASTIC_APM_API_KEY'),
        serviceName: this.get('ELASTIC_APM_SERVICE_NAME'),
        secretToken: this.get('ELASTIC_APM_SECRET_TOKEN'),
        serverUrl: this.get('ELASTIC_APM_SERVER_URL'),
        captureBody: this.get('ELASTIC_APM_CAPTURE_BODY') || 'all',
        indexPrefix: this.get('ELASTIC_APM_INDEX_PREFIX') || 'gic-logs',
        level: this.get('ELASTIC_APM_LOG_LEVEL') || 'info',
      },
      search: {
        enabled: this.get('ELASTIC_SEARCH_ENABLED') || false,
        cloudId: this.get('ELASTIC_SEARCH_CLOUD_ID'),
        apiKey: this.get('ELASTIC_SEARCH_API_KEY'),
      },
    };
  }

  get jwt() {
    return {
      secret: this.get('JWT_SECRET'),
      expire: this.get('JWT_EXPIRED'),
      source: this.get('JWT_SOURCE'),
    };
  }

  get redis() {
    return {
      host: this.get('REDIS_HOST'),
      url: this.get('REDIS_URL'),
      port: this.get('REDIS_PORT'),
      password: this.get('REDIS_PASSWORD'),
      role: this.get('REDIS_ROLE'),
      user: this.get('REDIS_USERNAME'),
      prefix: this.get('REDIS_PREFIX'),
      connectionName: this.get('REDIS_CONNECTION_NAME'),
      db: this.get('REDIS_DATABASE'),
    };
  }

  get redisStream() {
    return {
      host: this.get('REDIS_STREAM_HOST'),
      url: this.get('REDIS_STREAM_URL'),
      port: this.get('REDIS_STREAM_PORT'),
      password: this.get('REDIS_STREAM_PASSWORD'),
      role: this.get('REDIS_STREAM_ROLE'),
      user: this.get('REDIS_STREAM_USER'),
      prefix: this.get('REDIS_STREAM_PREFIX'),
      consumer: this.get('REDIS_STREAM_CONSUMER'),
      consumerGroup: this.get('REDIS_STREAM_CONSUMER_GROUP'),
    };
  }

  get redisRBAC() {
    return {
      host: this.get('RBAC_REDIS_HOST'),
      port: this.get('RBAC_REDIS_PORT'),
      prefix: this.get('RBAC_REDIS_PREFIX'),
      password: this.get('RBAC_REDIS_PASSWORD'),
      role: this.get('RBAC_REDIS_ROLE'),
      user: this.get('RBAC_REDIS_USERNAME'),
      db: this.get('RBAC_REDIS_DATABASE'),
      connectionName: this.get('RBAC_REDIS_NAME'),
    };
  }

  get queue() {
    return {
      host: this.get('QUEUE_HOST'),
      url: this.get('QUEUE_URL'),
      port: this.get('QUEUE_PORT'),
      password: this.get('QUEUE_PASSWORD'),
      role: this.get('QUEUE_ROLE'),
      user: this.get('QUEUE_USER'),
      prefix: this.get('QUEUE_PREFIX'),
      connectionName: this.get('QUEUE_CONNECTION_NAME'),
    };
  }

  get server() {
    return {
      maxExecutionTime: +this.get('MAX_EXECUTION_TIME') ?? 30000,
      throttle: {
        ttl: +process.env['THROTTLE_TTL'] ?? 60,
        limit: +process.env['THROTTLE_LIMIT'] ?? 10,
      },
    };
  }
}
