package com.stick.app.service;

import com.stick.app.domain.board.Board;
import com.stick.app.domain.memo.Memo;
import com.stick.app.domain.uploadeFile.UploadFile;
import com.stick.app.dto.MemoCreateRequest;
import com.stick.app.dto.MemoResponse;
import com.stick.app.repository.BoardRepository;
import com.stick.app.repository.MemoRepository;
import com.stick.app.repository.UploadFileRepository;
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

    public MemoResponse createMemo(MemoCreateRequest request) {
        Board board = boardRepository.findById(request.getBoardId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 보드."));
        List<UploadFile> attachments = new ArrayList<>();

        Memo memo = Memo.builder()
                .content(request.getContent())
                .board(board)
                .authorId(request.getAuthorId())
                .color(request.getColor())
                .createdAt(LocalDateTime.now())
                .attachments(attachments)
                .build();

        Memo saveMemo = memoRepository.save(memo);

        if (request.getAttachmentIds() != null && !request.getAttachmentIds().isEmpty()) {
            List<UploadFile> files = uploadFileRepository.findAllById(request.getAttachmentIds());
            for (UploadFile file : files) {
                file.setMemo(saveMemo);
            }
            uploadFileRepository.saveAll(files);
        }

        return MemoResponse.from(saveMemo);
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


}
