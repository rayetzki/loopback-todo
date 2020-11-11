import { Inject, Injectable } from "@nestjs/common";
import { UploadApiErrorResponse, UploadApiResponse, v2 as Cloudinary } from 'cloudinary';
import { from, Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";

@Injectable()
export class CloudinaryService {
    constructor(@Inject('Cloudinary') private readonly cloudinaryService: typeof Cloudinary) { }

    upload(avatar: string): Observable<UploadApiResponse | UploadApiErrorResponse> {
        return from(this.cloudinaryService.uploader.upload(avatar)).pipe(
            map((uploadResponse: UploadApiResponse) => uploadResponse),
            catchError((error: UploadApiErrorResponse) => throwError(error))
        );
    }
}