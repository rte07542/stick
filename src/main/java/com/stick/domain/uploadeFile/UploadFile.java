package com.stick.domain.uploadeFile;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.stick.domain.memo.Memo;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Builder
public class UploadFile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String originalName;
    private String storedName;
    private String url;
    private String contentType;
    private Long size;
    private LocalDateTime createdAt;

    @ManyToOne(fetch =  FetchType.LAZY)
    @JoinColumn(name = "memo_id")
    @JsonBackReference
    private Memo memo;
}
