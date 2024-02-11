import {
    Post,
    BadRequestException,
    Body,
    Controller,
    ForbiddenException,
    Get,
    NotFoundException,
    Param,
    ParseIntPipe,
    Put,
    UseInterceptors,
    UploadedFile,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import "multer";
import { Express } from "express";
import {
    Override,
    ReportCreateDTO,
    ReportModel,
    ReportUpdateDTO,
    ReportUpdateStatusDTO,
    ResponseFormatInterface,
} from "@trashtrack/common";

import { ResponseFormatInterceptor, formatResponse } from "../../interceptor/response-format.interceptor";

import { ExtendController } from "../extend.controller";

import { ReportService } from "./report.service";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

interface ReportControllerInterface {}

@Controller("report")
@UseInterceptors(ResponseFormatInterceptor)
export class ReportController
    extends ExtendController<ReportModel, ReportCreateDTO, ReportUpdateDTO, ReportService>
    implements ReportControllerInterface
{
    constructor(modelService: ReportService) {
        super(ReportController.name, modelService);
    }

    @Get("nik/:nik")
    public async findNIK(@Param("nik") nik: string): Promise<ResponseFormatInterface<ReportModel[]>> {
        this.loggerService.log(`NIK: ${nik}`);

        try {
            const response: ResponseFormatInterface<ReportModel[]> = formatResponse<ReportModel[]>(
                true,
                200,
                "NIK Found",
                await this.modelService.findNIK(nik)
            );

            this.loggerService.log(`Find NIK: ${JSON.stringify(response)}`);

            return response;
        } catch (error) {
            if (error instanceof NotFoundException) {
                this.loggerService.error(`Find NIK: ${error.message}`);
                return formatResponse<null>(false, 404, error.message, null);
            }

            this.loggerService.error(`Find NIK: ${error.message}`);
            return formatResponse<null>(false, 500, error.message, null);
        }
    }

    @Get("nik/:nik/extend")
    public async findNIKExtend(@Param("nik") nik: string): Promise<ResponseFormatInterface<ReportModel[]>> {
        try {
            const response: ResponseFormatInterface<ReportModel[]> = formatResponse<ReportModel[]>(
                true,
                200,
                "Extend NIK Found",
                await this.modelService.findNIKExtend(nik)
            );

            this.loggerService.log(`Find NIK Extend: ${JSON.stringify(response)}`);

            return response;
        } catch (error) {
            if (error instanceof NotFoundException) {
                this.loggerService.error(`Find NIK Extend: ${error.message}`);
                return formatResponse<null>(false, 404, error.message, null);
            }

            this.loggerService.error(`Find NIK Extend: ${error.message}`);
            return formatResponse<null>(false, 500, error.message, null);
        }
    }

    public async add(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        @Body() payload: ReportCreateDTO
    ): Promise<ResponseFormatInterface<ReportModel>> {
        this.loggerService.error(`Add: Method Is Disabled`);
        throw new ForbiddenException("Method Is Disabled");
    }

    @Override
    @Post()
    @UseInterceptors(FileInterceptor("image"))
    public async addWithUpload(
        @Body()
        payload: {
            trashBinId: number;
            nik: string;
            name: string;
            phoneNumber: string;
            description: string;
        },
        @UploadedFile() file: Express.Multer.File
    ): Promise<ResponseFormatInterface<ReportModel>> {
        return super.add({
            ...payload,
            imageName: file.originalname,
            imageData: file.buffer,
        });
    }

    public async change(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        @Param("id", ParseIntPipe) id: number,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        @Body() payload: ReportUpdateDTO
    ): Promise<ResponseFormatInterface<ReportModel>> {
        this.loggerService.error(`Change: Method Is Disabled`);
        throw new ForbiddenException("Method Is Disabled");
    }

    @Put(":id/status")
    public async changeStatus(
        @Param("id", ParseIntPipe) id: number,
        @Body() payload: ReportUpdateStatusDTO
    ): Promise<ResponseFormatInterface<ReportModel>> {
        try {
            const response: ResponseFormatInterface<ReportModel> = formatResponse<ReportModel>(
                true,
                200,
                "Status Changed",
                await this.modelService.change(id, payload)
            );

            this.loggerService.log(`Change Status: ${JSON.stringify(response)}`);

            return response;
        } catch (error) {
            if (error instanceof BadRequestException) {
                this.loggerService.error(`Change Status: ${error.message}`);
                return formatResponse<null>(false, 400, error.message, null);
            }

            if (error instanceof NotFoundException || error instanceof PrismaClientKnownRequestError) {
                this.loggerService.error(`Change Status: ${error.message}`);
                return formatResponse<null>(false, 404, error.message, null);
            }

            this.loggerService.error(`Change Status: ${error.message}`);
            return formatResponse<null>(false, 500, error.message, null);
        }
    }
}
