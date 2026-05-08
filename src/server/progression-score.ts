export type ProgressionWeights = {
  videosPoints: number;
  ebooksPoints: number;
  logsPoints: number;
};

const DEFAULT_WEIGHTS: ProgressionWeights = {
  videosPoints: 40,
  ebooksPoints: 30,
  logsPoints: 30
};

export type ProgressionInputs = {
  videosTotal: number;
  videosComplete: number;
  ebooksTotal: number;
  ebooksDownloadDistinct: number;
  logDaysInWindow: number;
  windowDays: number;
};

export type ProgressionResult = {
  total: number;
  breakdown: {
    videos: number;
    ebooks: number;
    logs: number;
  };
};

export function computeProgressionScore(
  input: ProgressionInputs,
  weights: ProgressionWeights = DEFAULT_WEIGHTS
): ProgressionResult {
  const vSafe = Math.max(0, input.videosTotal);
  const videoRatio = vSafe > 0 ? Math.min(1, input.videosComplete / vSafe) : 0;

  const eSafe = Math.max(0, input.ebooksTotal);
  const ebookRatio = eSafe > 0 ? Math.min(1, input.ebooksDownloadDistinct / eSafe) : 0;

  const wSafe = Math.max(1, input.windowDays);
  const logsRatio = Math.min(1, input.logDaysInWindow / wSafe);

  const videosPart = weights.videosPoints * videoRatio;
  const ebooksPart = weights.ebooksPoints * ebookRatio;
  const logsPart = weights.logsPoints * logsRatio;

  const totalRounded = Math.round(videosPart + ebooksPart + logsPart);

  return {
    total: Math.min(100, totalRounded),
    breakdown: {
      videos: Math.round(videosPart),
      ebooks: Math.round(ebooksPart),
      logs: Math.round(logsPart)
    }
  };
}
