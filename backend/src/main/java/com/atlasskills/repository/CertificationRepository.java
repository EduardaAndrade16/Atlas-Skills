package com.atlasskills.repository;

import com.atlasskills.model.entity.Certification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CertificationRepository extends JpaRepository<Certification, Long> {
    List<Certification> findByProfileId(Long profileId);
    Optional<Certification> findByIdAndProfileId(Long id, Long profileId);
}
