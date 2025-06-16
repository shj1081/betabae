import { Injectable } from '@nestjs/common';
import { Gender, MBTI } from '@prisma/client';

// Define types for the matching algorithm
export interface UserFeatures {
  mbti?: MBTI | null;
  interests: string[];
  loveLang: number[];
  personality: number[];
  location: { province: string; city: string };
  gender: Gender;
}

@Injectable()
export class MatchScoreService {
  /**
   * Calculate match score between two users based on multiple factors
   * @param currentUser - The current user's features
   * @param candidateUser - The candidate user's features
   * @returns An object containing detailed scores and the overall score
   */
  calculateMatchScore(currentUser: UserFeatures, candidateUser: UserFeatures): {
    mbtiScore: number;
    interestsScore: number;
    loveLanguageScore: number;
    personalityScore: number;
    locationScore: number;
    totalScore: number;
  } | null {
    // If users are the same gender (MALE-MALE or FEMALE-FEMALE), return null to exclude from feed
    if (
      currentUser.gender === candidateUser.gender &&
      (currentUser.gender === Gender.MALE || currentUser.gender === Gender.FEMALE)
    ) {
      return null; // Return null to completely exclude from feed
    }

    // Calculate individual similarity scores
    const mbtiScore = this.calculateMbtiSimilarity(currentUser.mbti, candidateUser.mbti);
    const interestsScore = this.calculateInterestsSimilarity(currentUser.interests, candidateUser.interests);
    const loveLanguageScore = this.calculateLoveLanguageSimilarity(currentUser.loveLang, candidateUser.loveLang);
    const personalityScore = this.calculatePersonalitySimilarity(currentUser.personality, candidateUser.personality);
    const locationScore = this.calculateLocationSimilarity(
      currentUser.location.province,
      currentUser.location.city,
      candidateUser.location.province,
      candidateUser.location.city
    );

    // Apply weights to each similarity score
    const weights = {
      mbti: 0.15,
      interests: 0.25,
      loveLanguage: 0.15,
      personality: 0.30,
      location: 0.15
    };

    // Calculate final match score
    const totalScore = (
      weights.mbti * mbtiScore +
      weights.interests * interestsScore +
      weights.loveLanguage * loveLanguageScore +
      weights.personality * personalityScore +
      weights.location * locationScore
    );
    
    // Return all scores
    return {
      mbtiScore,
      interestsScore,
      loveLanguageScore,
      personalityScore,
      locationScore,
      totalScore
    };
  }

  /**
   * Calculate MBTI similarity based on Dan Johnston's Simplified MBTI Compatibility Chart
   * @param mbti1 - First user's MBTI
   * @param mbti2 - Second user's MBTI
   * @returns Similarity score between 0 and 1
   */
  private calculateMbtiSimilarity(mbti1?: MBTI | null, mbti2?: MBTI | null): number {
    // If either MBTI is missing, return a neutral score
    if (!mbti1 || !mbti2) {
      return 0.5;
    }

    return this.compatibilityLevel(mbti1, mbti2);
  }

  /**
   * MBTI compatibility levels and their normalized scores
   */
  private readonly levelScore = {
    IDEAL:     1.00, // blue – Often Listed as Ideal Match
    GOOD:      0.85, // teal – It's Got a Good Chance
    ONE_SIDED: 0.70, // green – One-Sided Match
    WORKABLE:  0.55, // yellow – It Could Work, But Not Ideal
    CAUTION:   0.40, // red – Uh-Oh, Think This One Through
  };

  /**
   * Dan Johnston's Simplified MBTI Compatibility Chart matrix
   * Maps compatibility between any two MBTI types
   */
  private readonly MBTI_MATRIX: Record<string, Record<string, keyof typeof this.levelScore>> = {
    INFP: { // ────────────────────────────────────────────
      INFP:"GOOD", ENFP:"GOOD", INFJ:"GOOD", ENFJ:"IDEAL",
      INTJ:"GOOD", ENTJ:"IDEAL", INTP:"CAUTION", ENTP:"CAUTION",
      ISFP:"GOOD", ESFP:"CAUTION", ISTP:"CAUTION", ESTP:"CAUTION",
      ISFJ:"GOOD", ESFJ:"GOOD", ISTJ:"GOOD", ESTJ:"GOOD",
    },
    ENFP: {
      INFP:"GOOD", ENFP:"GOOD", INFJ:"IDEAL", ENFJ:"GOOD",
      INTJ:"IDEAL", ENTJ:"GOOD", INTP:"GOOD", ENTP:"GOOD",
      ISFP:"CAUTION", ESFP:"CAUTION", ISTP:"CAUTION", ESTP:"CAUTION",
      ISFJ:"GOOD", ESFJ:"GOOD", ISTJ:"GOOD", ESTJ:"GOOD",
    },
    INFJ: {
      INFP:"GOOD", ENFP:"IDEAL", INFJ:"GOOD", ENFJ:"GOOD",
      INTJ:"GOOD", ENTJ:"GOOD", INTP:"GOOD", ENTP:"IDEAL",
      ISFP:"CAUTION", ESFP:"CAUTION", ISTP:"CAUTION", ESTP:"CAUTION",
      ISFJ:"GOOD", ESFJ:"GOOD", ISTJ:"GOOD", ESTJ:"GOOD",
    },
    ENFJ: {
      INFP:"IDEAL", ENFP:"GOOD", INFJ:"GOOD", ENFJ:"GOOD",
      INTJ:"GOOD", ENTJ:"GOOD", INTP:"GOOD", ENTP:"GOOD",
      ISFP:"GOOD", ESFP:"GOOD", ISTP:"CAUTION", ESTP:"CAUTION",
      ISFJ:"GOOD", ESFJ:"IDEAL", ISTJ:"GOOD", ESTJ:"GOOD",
    },
    INTJ: {
      INFP:"GOOD", ENFP:"IDEAL", INFJ:"GOOD", ENFJ:"GOOD",
      INTJ:"GOOD", ENTJ:"IDEAL", INTP:"GOOD", ENTP:"GOOD",
      ISFP:"WORKABLE", ESFP:"WORKABLE", ISTP:"GOOD", ESTP:"WORKABLE",
      ISFJ:"WORKABLE", ESFJ:"WORKABLE", ISTJ:"GOOD", ESTJ:"GOOD",
    },
    ENTJ: {
      INFP:"IDEAL", ENFP:"GOOD", INFJ:"GOOD", ENFJ:"GOOD",
      INTJ:"IDEAL", ENTJ:"GOOD", INTP:"GOOD", ENTP:"GOOD",
      ISFP:"WORKABLE", ESFP:"WORKABLE", ISTP:"WORKABLE", ESTP:"WORKABLE",
      ISFJ:"WORKABLE", ESFJ:"WORKABLE", ISTJ:"GOOD", ESTJ:"GOOD",
    },
    INTP: {
      INFP:"CAUTION", ENFP:"GOOD", INFJ:"GOOD", ENFJ:"GOOD",
      INTJ:"GOOD", ENTJ:"GOOD", INTP:"GOOD", ENTP:"GOOD",
      ISFP:"WORKABLE", ESFP:"WORKABLE", ISTP:"GOOD", ESTP:"WORKABLE",
      ISFJ:"WORKABLE", ESFJ:"WORKABLE", ISTJ:"GOOD", ESTJ:"GOOD",
    },
    ENTP: {
      INFP:"CAUTION", ENFP:"GOOD", INFJ:"IDEAL", ENFJ:"GOOD",
      INTJ:"GOOD", ENTJ:"GOOD", INTP:"GOOD", ENTP:"GOOD",
      ISFP:"WORKABLE", ESFP:"WORKABLE", ISTP:"WORKABLE", ESTP:"WORKABLE",
      ISFJ:"WORKABLE", ESFJ:"WORKABLE", ISTJ:"GOOD", ESTJ:"GOOD",
    },
    ISFP: {
      INFP:"GOOD", ENFP:"CAUTION", INFJ:"CAUTION", ENFJ:"GOOD",
      INTJ:"WORKABLE", ENTJ:"WORKABLE", INTP:"WORKABLE", ENTP:"WORKABLE",
      ISFP:"GOOD", ESFP:"GOOD", ISTP:"GOOD", ESTP:"GOOD",
      ISFJ:"GOOD", ESFJ:"GOOD", ISTJ:"GOOD", ESTJ:"GOOD",
    },
    ESFP: {
      INFP:"CAUTION", ENFP:"CAUTION", INFJ:"CAUTION", ENFJ:"GOOD",
      INTJ:"WORKABLE", ENTJ:"WORKABLE", INTP:"WORKABLE", ENTP:"WORKABLE",
      ISFP:"GOOD", ESFP:"GOOD", ISTP:"GOOD", ESTP:"GOOD",
      ISFJ:"GOOD", ESFJ:"GOOD", ISTJ:"GOOD", ESTJ:"GOOD",
    },
    ISTP: {
      INFP:"CAUTION", ENFP:"CAUTION", INFJ:"CAUTION", ENFJ:"CAUTION",
      INTJ:"GOOD", ENTJ:"WORKABLE", INTP:"GOOD", ENTP:"WORKABLE",
      ISFP:"GOOD", ESFP:"GOOD", ISTP:"GOOD", ESTP:"GOOD",
      ISFJ:"GOOD", ESFJ:"GOOD", ISTJ:"GOOD", ESTJ:"GOOD",
    },
    ESTP: {
      INFP:"CAUTION", ENFP:"CAUTION", INFJ:"CAUTION", ENFJ:"CAUTION",
      INTJ:"WORKABLE", ENTJ:"WORKABLE", INTP:"WORKABLE", ENTP:"WORKABLE",
      ISFP:"GOOD", ESFP:"GOOD", ISTP:"GOOD", ESTP:"GOOD",
      ISFJ:"GOOD", ESFJ:"GOOD", ISTJ:"GOOD", ESTJ:"GOOD",
    },
    ISFJ: {
      INFP:"GOOD", ENFP:"GOOD", INFJ:"GOOD", ENFJ:"GOOD",
      INTJ:"WORKABLE", ENTJ:"WORKABLE", INTP:"WORKABLE", ENTP:"WORKABLE",
      ISFP:"GOOD", ESFP:"GOOD", ISTP:"GOOD", ESTP:"GOOD",
      ISFJ:"GOOD", ESFJ:"IDEAL", ISTJ:"GOOD", ESTJ:"GOOD",
    },
    ESFJ: {
      INFP:"GOOD", ENFP:"GOOD", INFJ:"GOOD", ENFJ:"IDEAL",
      INTJ:"WORKABLE", ENTJ:"WORKABLE", INTP:"WORKABLE", ENTP:"WORKABLE",
      ISFP:"GOOD", ESFP:"GOOD", ISTP:"GOOD", ESTP:"GOOD",
      ISFJ:"IDEAL", ESFJ:"GOOD", ISTJ:"GOOD", ESTJ:"GOOD",
    },
    ISTJ: {
      INFP:"GOOD", ENFP:"GOOD", INFJ:"GOOD", ENFJ:"GOOD",
      INTJ:"GOOD", ENTJ:"GOOD", INTP:"GOOD", ENTP:"GOOD",
      ISFP:"GOOD", ESFP:"GOOD", ISTP:"GOOD", ESTP:"GOOD",
      ISFJ:"GOOD", ESFJ:"GOOD", ISTJ:"GOOD", ESTJ:"GOOD",
    },
    ESTJ: {
      INFP:"GOOD", ENFP:"GOOD", INFJ:"GOOD", ENFJ:"GOOD",
      INTJ:"GOOD", ENTJ:"GOOD", INTP:"GOOD", ENTP:"GOOD",
      ISFP:"GOOD", ESFP:"GOOD", ISTP:"GOOD", ESTP:"GOOD",
      ISFJ:"GOOD", ESFJ:"GOOD", ISTJ:"GOOD", ESTJ:"GOOD",
    },
  };

  /**
   * Calculate compatibility score between two MBTI types using the matrix
   * @param mbti1 First MBTI type
   * @param mbti2 Second MBTI type
   * @returns Compatibility score between 0.40 and 1.00
   */
  private compatibilityLevel(mbti1: MBTI, mbti2: MBTI): number {
    const level = this.MBTI_MATRIX[mbti1][mbti2];
    return this.levelScore[level];
  }

  /**
   * Calculate interests similarity based on matching comma-separated interests
   * @param interests1 - First user's interests
   * @param interests2 - Second user's interests
   * @returns Similarity score between 0 and 1
   */
  private calculateInterestsSimilarity(interests1: string[], interests2: string[]): number {
    // Process interests: split by comma, trim, and convert to lowercase
    const processInterests = (interests: string[]): string[] => {
      // Join all interests into a single string if array, then split by comma
      const interestsStr = interests.join(',');
      // Split by comma, trim whitespace, and convert to lowercase
      return interestsStr.split(',').map(item => item.trim().toLowerCase()).filter(item => item.length > 0);
    };

    const items1 = processInterests(interests1);
    const items2 = processInterests(interests2);

    // If both arrays are empty, return neutral score
    if (items1.length === 0 && items2.length === 0) {
      return 0.5;
    }
    
    // If one array is empty, return low score
    if (items1.length === 0 || items2.length === 0) {
      return 0.1;
    }

    // Count matching interests
    let matchCount = 0;
    for (const item1 of items1) {
      if (items2.includes(item1)) {
        matchCount++;
      }
    }
    
    // Calculate similarity as proportion of matches to total unique interests
    const uniqueInterests = new Set([...items1, ...items2]);
    return matchCount / uniqueInterests.size;
  }

  /**
   * Calculate love language similarity using Spearman rank correlation
   * @param loveLang1 - First user's love language scores
   * @param loveLang2 - Second user's love language scores
   * @returns Similarity score between 0 and 1
   */
  private calculateLoveLanguageSimilarity(loveLang1: number[], loveLang2: number[]): number {
    // If either love language data is missing or invalid, return neutral score
    if (!loveLang1 || !loveLang2 || loveLang1.length !== 5 || loveLang2.length !== 5) {
      return 0.5;
    }

    // Calculate ranks
    const getRanks = (scores: number[]): number[] => {
      // Create array of [value, index] pairs
      const indexed = scores.map((value, index) => ({ value, index }));
      
      // Sort by value in descending order
      indexed.sort((a, b) => b.value - a.value);
      
      // Assign ranks (1-based)
      const ranks = new Array(scores.length).fill(0);
      indexed.forEach((item, rank) => {
        ranks[item.index] = rank + 1;
      });
      
      return ranks;
    };

    const ranks1 = getRanks(loveLang1);
    const ranks2 = getRanks(loveLang2);

    // Calculate Spearman correlation
    let sumSquaredDiff = 0;
    for (let i = 0; i < 5; i++) {
      sumSquaredDiff += Math.pow(ranks1[i] - ranks2[i], 2);
    }

    const rho = 1 - (6 * sumSquaredDiff) / 120; // 120 = 5*(5^2-1)
    
    // Normalize from [-1,1] to [0,1]
    return (rho + 1) / 2;
  }

  /**
   * Calculate personality similarity using Euclidean distance
   * @param personality1 - First user's Big Five personality scores
   * @param personality2 - Second user's Big Five personality scores
   * @returns Similarity score between 0 and 1
   */
  private calculatePersonalitySimilarity(personality1: number[], personality2: number[]): number {
    // If either personality data is missing or invalid, return neutral score
    if (!personality1 || !personality2 || personality1.length !== 5 || personality2.length !== 5) {
      return 0.5;
    }

    // Normalize scores to [0,1]
    const normalize = (scores: number[]): number[] => {
      return scores.map(score => (score - 1) / 4);
    };

    const normalized1 = normalize(personality1);
    const normalized2 = normalize(personality2);

    // Calculate Euclidean distance
    let sumSquaredDiff = 0;
    for (let i = 0; i < 5; i++) {
      sumSquaredDiff += Math.pow(normalized1[i] - normalized2[i], 2);
    }
    const distance = Math.sqrt(sumSquaredDiff);
    
    // Maximum possible distance in 5D space with [0,1] coordinates
    const maxDistance = Math.sqrt(5);
    
    // Convert distance to similarity
    return 1 - (distance / maxDistance);
  }

  /**
   * Calculate location similarity based on province and city
   * @param province1 - First user's province
   * @param city1 - First user's city
   * @param province2 - Second user's province
   * @param city2 - Second user's city
   * @returns Similarity score between 0 and 1
   */
  private calculateLocationSimilarity(
    province1: string,
    city1: string,
    province2: string,
    city2: string
  ): number {
    if (city1 === city2) {
      return 1.0; // Same city
    } else if (province1 === province2) {
      return 0.8; // Same province
    } else {
      return 0.5; // Different province
    }
  }
}
