import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { v2 as Cloudinary } from "cloudinary";
import { CloudinaryService } from "./cloudinary.service";

const CLOUDINARY = 'Cloudinary';

@Module({
    imports: [ConfigModule],
    providers: [{
        provide: CLOUDINARY,
        useFactory: (configService: ConfigService) => {
            Cloudinary.config({
                cloud_name: configService.get('CLOUDINARY_CLOUD_NAME'),
                api_key: configService.get('CLOUDINARY_API_KEY'),
                api_secret: configService.get('CLOUDINARY_API_SECRET')
            })

            return Cloudinary;
        },
        inject: [ConfigService]
    }, CloudinaryService],
    exports: [CloudinaryService]
})

export class CloudinaryModule { }