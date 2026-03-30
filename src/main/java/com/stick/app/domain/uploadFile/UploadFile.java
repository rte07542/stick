package com.stick.app.domain.uploadFile;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.stick.global.domain.BaseEntity;
import com.stick.app.domain.memo.Memo;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UploadFile extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String originalName;
    private String storedName;
    private String url;
    private String contentType;
    private Long size;

    @ManyToOne(fetch =  FetchType.LAZY)
    @JoinColumn(name = "memo_id")
    @JsonBackReference
    private Memo memo;
}
