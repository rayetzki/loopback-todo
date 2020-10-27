import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HelmetMiddleware } from '@nest-middlewares/helmet';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CorsMiddleware } from '@nest-middlewares/cors';
import { CsurfMiddleware } from '@nest-middlewares/csurf';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { RecipeEntity } from './recipes/recipes.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: true,
      entities: [__dirname.concat('/../**/*.entity.js')]
    }),
    UserModule,
    AuthModule,
    RecipeEntity
  ],
  controllers: [AppController],
  providers: [AppService]
})

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    HelmetMiddleware.configure({ xssFilter: true });
    CorsMiddleware.configure({ origin: [process.env.LOCALHOST_URL] });
    consumer.apply(HelmetMiddleware);
    consumer.apply(CorsMiddleware);
    consumer.apply(CsurfMiddleware);
  }
}
