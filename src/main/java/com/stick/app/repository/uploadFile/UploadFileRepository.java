package com.stick.app.repository.uploadFile;


import com.stick.app.domain.uploadFile.UploadFile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UploadFileRepository extends JpaRepository<UploadFile, Long> {
}
