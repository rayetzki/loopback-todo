import { Inject, Injectable } from "@nestjs/common";
import { UploadApiErrorResponse, UploadApiResponse, v2 as Cloudinary } from 'cloudinary';
import { from, Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";

@Injectable()
export class CloudinaryService {
    constructor(@Inject('Cloudinary') private readonly cloudinaryService: typeof Cloudinary) { }

    upload(folder: string, avatar: string): Observable<UploadApiResponse | UploadApiErrorResponse> {
        return from(this.cloudinaryService.uploader.upload(avatar, { folder })).pipe(
            map((uploadResponse: UploadApiResponse) => uploadResponse),
            catchError((error: UploadApiErrorResponse) => throwError(error))
        );
    }

    uploadStream(folder, file): Promise<UploadApiResponse | UploadApiErrorResponse> {
        return new Promise((resolve, reject) => {
            this.cloudinaryService.uploader.upload_stream(
                { folder, resource_type: 'raw' },
                (error: UploadApiErrorResponse, result: UploadApiResponse) => {
                    if (error) reject(error);
                    resolve(result);
                }
            ).end(Buffer.from(file.buffer));
        });
    }
}