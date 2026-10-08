package com.trungpd.eventticketplatform.common.storage.repository;

import com.trungpd.eventticketplatform.common.storage.entity.FileEntity;
import com.trungpd.eventticketplatform.common.storage.enums.FileType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FileRepository extends JpaRepository<FileEntity, Long> {

    Optional<FileEntity> findByReferenceIdAndReferenceTypeAndFileType(
            Long referenceId, String referenceType, FileType fileType);

}
