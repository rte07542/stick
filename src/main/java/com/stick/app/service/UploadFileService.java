package com.stick.app.service;

import com.stick.app.domain.uploadFile.UploadFile;
import com.stick.app.dto.UploadFileResponse;
import com.stick.app.repository.uploadFile.UploadFileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UploadFileService {
    private final UploadFileRepository uploadFileRepository;
    private final String uploadDir = System.getProperty("user.dir")+"/uploads";

    public List<UploadFileResponse> uploadFiles(List<MultipartFile> files) {
        return files.stream()
                .map(this::uploadSingleFile)
                .toList();
    }

    public UploadFileResponse uploadSingleFile(MultipartFile file){
        validateImage(file);

        try{
            Path uploadPath = Paths.get(uploadDir);
            if (Files.notExists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalName = file.getOriginalFilename();
            String storedName = UUID.randomUUID() + "_" + originalName;
            Path filePath = uploadPath.resolve(storedName);

            file.transferTo(filePath.toFile());

            UploadFile uploadFile = UploadFile.builder()
                    .originalName(originalName)
                    .storedName(storedName)
                    .url("/uploads/" + storedName)
                    .contentType(file.getContentType())
                    .size(file.getSize())
                    .build();

            return UploadFileResponse.from(uploadFileRepository.save(uploadFile));

        } catch (IOException e) {
            throw new RuntimeException("파일 저장 실패",e);
        }
    }

    private void validateImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw  new IllegalArgumentException("빈 파일은 업로드할 수 없음");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("이미지 파일만 업로드 가능");
        }

        long maxSize = 5 * 1024 * 1024; //5MB
        if (file.getSize() > maxSize) {
            throw new IllegalArgumentException("파일 크기는 5MB 이하여야 함");
        }
    }
}
