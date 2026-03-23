package com.stick.dto;

import com.stick.domain.uploadeFile.UploadFile;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UploadFileResponse {
    private Long id;
    private String originalName;
    private String storedName;
    private String url;
    private String contentType;
    private Long size;

    public static UploadFileResponse from(UploadFile file){
        return UploadFileResponse.builder()
                .id(file.getId())
                .originalName(file.getOriginalName())
                .storedName(file.getStoredName())
                .url(file.getUrl())
                .contentType(file.getContentType())
                .size(file.getSize())
                .build();
    }
}
