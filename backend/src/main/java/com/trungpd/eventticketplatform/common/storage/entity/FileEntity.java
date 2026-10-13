package com.trungpd.eventticketplatform.common.storage.entity;

import com.trungpd.eventticketplatform.common.entity.BaseEntity;
import com.trungpd.eventticketplatform.common.storage.enums.FileType;
import com.trungpd.eventticketplatform.common.storage.enums.PlatformType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;

import java.sql.Types;

@Entity
@Table(name = "files")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FileEntity extends BaseEntity {

    @Column(name = "url", nullable = false, length = 500)
    private String url;

    @Column(name = "public_id", length = 255)
    private String publicId;

    @Enumerated(EnumType.STRING)
    @Column(name = "platform_type", nullable = false, length = 50)
    private PlatformType platformType;

    @Enumerated(EnumType.ORDINAL)
    @JdbcTypeCode(Types.INTEGER)
    @Column(name = "file_type", nullable = false)
    private FileType fileType;

    @Column(name = "content_type", length = 100)
    private String contentType;

    @Column(name = "size_bytes")
    private Long sizeBytes;

    @Column(name = "width")
    private Integer width;

    @Column(name = "height")
    private Integer height;

    @Column(name = "uploaded_by", length = 255)
    private String uploadedBy;

    @Column(name = "reference_id")
    private Long referenceId;

    @Column(name = "reference_type", length = 50)
    private String referenceType;
}
