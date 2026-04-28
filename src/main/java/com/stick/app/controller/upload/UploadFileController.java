package com.stick.app.controller.upload;

import com.stick.app.dto.UploadFileResponse;
import com.stick.app.service.upload.UploadFileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/uploads")
public class UploadFileController {
    private final UploadFileService uploadFileService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public List<UploadFileResponse> uploadFiles(
            @RequestPart("files") List<MultipartFile> files
    ) {
        return uploadFileService.uploadFiles(files);
    }
}
