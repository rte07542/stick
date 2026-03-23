package com.stick.service;

import com.stick.domain.board.Board;
import com.stick.domain.memo.Memo;
import com.stick.domain.uploadeFile.UploadFile;
import com.stick.dto.MemoCreateRequest;
import com.stick.dto.MemoResponse;
import com.stick.repository.BoardRepository;
import com.stick.repository.MemoRepository;
import com.stick.repository.UploadFileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MemoService {
    private final BoardRepository boardRepository;
    private final MemoRepository memoRepository;
    private final UploadFileRepository uploadFileRepository;

    public Memo createMemo(String content, Long boardId, Long authorId, String color){

        Board board = findBoardById(boardId);

        Memo memo = Memo.builder()
                .content(content)
                .board(board)
                .authorId(authorId)
                .color(color)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return memoRepository.save(memo);
    }

    public List<Memo> getMemosByBoardId(Long boardId){
        return memoRepository.findByBoardId(boardId);
    }
    public Memo getMemoById(Long id){
        return memoRepository.findById(id)
                .orElseThrow(()->new IllegalArgumentException("해당 Memo가 없음. Id="+id));
    }

    public Memo updateMemo(Long id, String content, String color){
        Memo memo = memoRepository.findById(id)
                .orElseThrow(()->new IllegalArgumentException("해당 Memo가 없음. id="+id));
        memo.setContent(content);
        memo.setColor(color);
        memo.setUpdatedAt(LocalDateTime.now());

        return memoRepository.save(memo);
    }

    public void deleteMemo(Long id){
        Memo memo = memoRepository.findById(id)
                .orElseThrow(()->new IllegalArgumentException("해당 memo가 없음 id="+id));
        memoRepository.delete(memo);
    }


    private Board findBoardById(Long boardId){
        return boardRepository.findById(boardId)
                .orElseThrow(()->new IllegalArgumentException("해당 board가 없음. id"+boardId));
    }

    public MemoResponse createMemo(MemoCreateRequest request) {
        Board board = boardRepository.findById(request.getBoardId())
                .orElseThrow(()->new IllegalArgumentException("존재하지 않는 보드."));
        List<UploadFile> attachments = new ArrayList<>();

        Memo saveMemo = memoRepository.save(memo);

        if (request.getAttachmentIds() != null && !request.getAttachmentIds().isEmpty()) {
            List<UploadFile> files = uploadFileRepository.findAllById(request.getAttachmentIds());
            for (UploadFile file : files){
                file.setMemo(saveMemo);
            }
            uploadFileRepository.saveAll(files);
        }

        Memo memo = Memo.builder()
                .content(request.getContent())
                .board(board)
                .authorId(request.getAuthorId())
                .color(request.getColor())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .attachments(attachments)
                .build();

        return MemoResponse.from(saveMemo);
    }
}
