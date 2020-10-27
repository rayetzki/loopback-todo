import { HttpException, Inject, Injectable, InternalServerErrorException } from "@nestjs/common";
import { DeleteApiResponse, ResourceApiResponse, UploadApiErrorResponse, UploadApiResponse, v2 as Cloudinary } from 'cloudinary';
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

    updateAvatar(url: string, avatar: string): Promise<void | UploadApiResponse | UploadApiErrorResponse> {
        return this.cloudinaryService.api.resources().then((images: ResourceApiResponse) => {
            const image: ResourceApiResponse['resources']['0'] = images.resources.find(image => image.secure_url === url);
            this.cloudinaryService.uploader.destroy(image.public_id)
                .then((deleteResponse: DeleteApiResponse) => {
                    if (deleteResponse.http_code === 200) {
                        return this.upload(avatar)
                            .toPromise<UploadApiResponse | UploadApiErrorResponse>()
                            .then((uploadResponse: UploadApiResponse) => uploadResponse)
                            .catch((error: UploadApiErrorResponse) => {
                                throw new InternalServerErrorException({
                                    message: 'Could\'nt update avatar', ...error
                                })
                            });
                    } else {
                        throw new InternalServerErrorException({ message: 'Could\'nt update avatar' });
                    }
                }).catch((error: DeleteApiResponse) => new HttpException(error.message, 500))
        });
    }
}