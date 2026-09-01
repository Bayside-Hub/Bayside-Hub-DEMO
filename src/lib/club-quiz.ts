import type { Club } from "./data";

export type QuizAnswers = {
  interests: string[];
  days: string[];
  wantsStem: boolean;
  wantsService: boolean;
  maxCommitment: number;
};

export type ClubRecommendation = { club: Club; score: number; reasons: string[] };

export function rankClubs(clubs: Club[], answers: QuizAnswers): ClubRecommendation[] {
  return clubs
    .map((club) => {
      let score = 0;
      const reasons: string[] = [];
      if (answers.interests.includes(club.category)) {
        score += 5;
        reasons.push(`Matches your ${club.category} interest`);
      }
      if (answers.days.length && club.meetingDays.some((day) => answers.days.includes(day))) {
        score += 3;
        reasons.push("Meets on a day you're available");
      }
      if (answers.wantsStem && club.stem) {
        score += 3;
        reasons.push("Includes STEM activities");
      }
      if (answers.wantsService && club.communityService) {
        score += 3;
        reasons.push("Offers community service");
      }
      if (!answers.maxCommitment || club.commitment <= answers.maxCommitment) {
        score += 2;
        reasons.push("Fits your weekly time commitment");
      }
      return { club, score, reasons };
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score || a.club.name.localeCompare(b.club.name));
}
