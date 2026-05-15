package com.stick.app.service.memo;

import com.stick.app.domain.board.Board;
import com.stick.app.domain.memo.Memo;
import com.stick.app.domain.uploadFile.UploadFile;
import com.stick.app.dto.MemoCreateRequest;
import com.stick.app.dto.MemoResponse;
import com.stick.app.repository.board.BoardRepository;
import com.stick.app.repository.memo.MemoRepository;
import com.stick.app.repository.uploadFile.UploadFileRepository;
import com.stick.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MemoService {
    private final BoardRepository boardRepository;
    private final MemoRepository memoRepository;
    private final UploadFileRepository uploadFileRepository;
    private final UserService userService;

    @Transactional
    public MemoResponse createMemo(MemoCreateRequest request, Long authorId) {
        boolean hasContent = request.getContent() != null && !request.getContent().trim().isEmpty();
        boolean hasAttachment = request.getAttachmentIds() != null && !request.getAttachmentIds().isEmpty();

        if (!hasContent && !hasAttachment) {
            throw new IllegalArgumentException("내용 또는 첨부파일이 필요합니다.");
        }

        Board board = boardRepository.findById(request.getBoardId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 보드."));

        Memo memo = Memo.builder()
                .content(request.getContent())
                .board(board)
                .authorId(authorId)
                .color(request.getColor())
                .attachments(new ArrayList<>())
                .build();

        Memo saveMemo = memoRepository.save(memo);
        String nickname = userService.getUserById(authorId).getNickname();

        if (request.getAttachmentIds() != null && !request.getAttachmentIds().isEmpty()) {
            List<UploadFile> files = uploadFileRepository.findAllById(request.getAttachmentIds());
            for (UploadFile file : files) {
                file.setMemo(saveMemo);
            }
            uploadFileRepository.saveAll(files);
        }

        return MemoResponse.from(saveMemo, nickname);
    }

    public List<Memo> getMemosByBoardId(Long boardId) {
        return memoRepository.findByBoardId(boardId);
    }

    public Memo getMemoById(Long id) {
        return memoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 Memo가 없음. Id=" + id));
    }

    @Transactional
    public Memo updateMemo(Long id, String content, String color, List<Long> attachmentIds) {
        Memo memo = memoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 Memo가 없음. id=" + id));
        memo.setContent(content);
        memo.setColor(color);

        if (attachmentIds != null) {
            memo.getAttachments().removeIf(file -> !attachmentIds.contains(file.getId()));

            List<Long> currentIds = memo.getAttachments().stream()
                    .map(UploadFile::getId).toList();
            List<Long> toAddIds = attachmentIds.stream()
                    .filter(aid -> !currentIds.contains(aid)).toList();

            if (!toAddIds.isEmpty()) {
                List<UploadFile> toAdd = uploadFileRepository.findAllById(toAddIds);
                for (UploadFile file : toAdd) {
                    file.setMemo(memo);
                    memo.getAttachments().add(file);
                }
            }
        }
        return memoRepository.save(memo);
    }

    @Transactional
    public void deleteMemo(Long id) {
        Memo memo = memoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 memo가 없음 id=" + id));
        memoRepository.delete(memo);
    }


}
