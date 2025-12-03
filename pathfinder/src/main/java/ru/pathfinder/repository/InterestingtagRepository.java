package ru.pathfinder.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import ru.pathfinder.domain.Interestingtag;

@Repository
public interface InterestingtagRepository extends JpaRepository<Interestingtag, Long> {
    
    @Query(value = "SELECT * FROM interestingtag WHERE ST_DWithin(coordinates, ST_MakePoint(:lat, :lon), :radius)", 
           nativeQuery = true)
    List<Interestingtag> findWithinRadius(@Param("lat") double lat, 
                                          @Param("lon") double lon, 
                                          @Param("radius") double radius);
    
    List<Interestingtag> findByCategoryId(Long categoryId);
}