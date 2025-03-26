import React from 'react';
import type { RewardTier, RewardBenefit } from '../types/database';
import { Crown, Star, Gift } from 'lucide-react';

type RewardsProgressProps = {
  currentPoints: number;
  tiers: RewardTier[];
  benefits: RewardBenefit[];
  currentTier: RewardTier | null;
};

export default function RewardsProgress({
  currentPoints,
  tiers,
  benefits,
  currentTier
}: RewardsProgressProps) {
  const nextTier = tiers.find(tier => tier.points_threshold > currentPoints);
  const currentTierBenefits = benefits.filter(b => b.tier_id === currentTier?.id);

  const getTierIcon = (iconName: string) => {
    switch (iconName) {
      case 'crown': return <Crown className="h-5 w-5" />;
      case 'star': return <Star className="h-5 w-5" />;
      case 'gift': return <Gift className="h-5 w-5" />;
      default: return <Star className="h-5 w-5" />;
    }
  };

  const getTierColors = (tierName: string) => {
    switch (tierName.toLowerCase()) {
      case 'bronze':
        return {
          text: 'text-amber-500',
          bg: 'bg-amber-900/20',
          icon: 'text-amber-500',
          border: 'border-amber-500/20',
          gradient: 'from-amber-700/80 via-amber-600/80 to-amber-500/80',
          glow: 'shadow-amber-500/20',
          background: 'bg-gradient-radial from-amber-900/30 via-black to-black'
        };
      case 'silver':
        return {
          text: 'text-gray-300',
          bg: 'bg-gray-500/20',
          icon: 'text-gray-300',
          border: 'border-gray-400/20',
          gradient: 'from-gray-500/80 via-gray-400/80 to-gray-300/80',
          glow: 'shadow-gray-400/20',
          background: 'bg-gradient-radial from-gray-500/30 via-black to-black'
        };
      case 'gold':
        return {
          text: 'text-yellow-500',
          bg: 'bg-yellow-900/20',
          icon: 'text-yellow-500',
          border: 'border-yellow-500/20',
          gradient: 'from-yellow-700/80 via-yellow-600/80 to-yellow-500/80',
          glow: 'shadow-yellow-500/20',
          background: 'bg-gradient-radial from-yellow-900/30 via-black to-black'
        };
      case 'platinum':
        return {
          text: 'text-sky-400',
          bg: 'bg-sky-900/20',
          icon: 'text-sky-400',
          border: 'border-sky-500/20',
          gradient: 'from-sky-700/80 via-sky-500/80 to-sky-400/80',
          glow: 'shadow-sky-500/20',
          background: 'bg-gradient-radial from-sky-900/30 via-black to-black'
        };
      default:
        return {
          text: 'text-purple-400',
          bg: 'bg-purple-900/20',
          icon: 'text-purple-400',
          border: 'border-purple-500/20',
          gradient: 'from-purple-700/80 via-purple-600/80 to-purple-500/80',
          glow: 'shadow-purple-500/20',
          background: 'bg-gradient-radial from-purple-900/30 via-black to-black'
        };
    }
  };

  const currentTierColors = currentTier ? getTierColors(currentTier.name) : getTierColors('');

  // Calculate the maximum points threshold for the progress bar
  const maxPoints = Math.max(...tiers.map(tier => tier.points_threshold));

  // Calculate segment widths for the progress bar
  const getSegmentWidth = (tier: RewardTier, nextTierThreshold: number) => {
    const segmentPoints = nextTierThreshold - tier.points_threshold;
    return (segmentPoints / maxPoints) * 100;
  };

  // Calculate progress within current tier
  const getCurrentProgress = () => {
    if (!currentTier || !nextTier) return 100;
    const tierProgress = currentPoints - currentTier.points_threshold;
    const tierRange = nextTier.points_threshold - currentTier.points_threshold;
    return (tierProgress / tierRange) * 100;
  };

  return (
    <div className="relative">
      {/* Dynamic Background */}
      <div className={`absolute inset-0 ${currentTierColors.background} transition-colors duration-1000 rounded-xl opacity-50`} />

      {/* Content */}
      <div className="glass-effect rounded-xl p-6 border border-gray-800/50 relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">Rewards Status</h2>
            <div className="flex items-center mt-2 space-x-2">
              <span className={currentTierColors.icon}>
                {currentTier && getTierIcon(currentTier.icon)}
              </span>
              <span className={`text-base font-medium ${currentTierColors.text}`}>
                {currentTier?.name}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400 mb-1">Total Points</div>
            <div className={`text-3xl font-bold ${currentTierColors.text} points-glow flex items-center justify-end`}>
              <span className="points-badge flex items-center space-x-2">
                <span className="pulse-dot" />
                <span>{currentPoints.toLocaleString()}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="mt-4">
          <div className="relative">
            {/* Tier Labels */}
            <div className="flex justify-between mb-2">
              {tiers.map((tier) => (
                <div
                  key={tier.id}
                  className={`text-xs font-medium ${
                    currentTier?.id === tier.id
                      ? getTierColors(tier.name).text
                      : 'text-gray-500'
                  }`}
                  style={{
                    width: '20%',
                    textAlign: tier === tiers[0] ? 'left' : tier === tiers[tiers.length - 1] ? 'right' : 'center'
                  }}
                >
                  {tier.name}
                </div>
              ))}
            </div>

            {/* Progress Bar */}
            <div className="h-4 glass-effect rounded-full overflow-hidden border border-gray-800/50">
              <div className="h-full flex relative">
                {tiers.map((tier, index) => {
                  const nextTierThreshold = tiers[index + 1]?.points_threshold || maxPoints;
                  const width = getSegmentWidth(tier, nextTierThreshold);
                  const colors = getTierColors(tier.name);
                  const isActive = currentPoints >= tier.points_threshold;
                  const isCurrentTier = currentTier?.id === tier.id;

                  return (
                    <div
                      key={tier.id}
                      className={`h-full relative transition-all duration-700 ${
                        isActive
                          ? `bg-gradient-to-r ${colors.gradient} shadow-[0_0_15px] ${colors.glow}`
                          : 'bg-gray-800/30'
                      }`}
                      style={{
                        width: `${width}%`,
                        clipPath: isCurrentTier
                          ? `polygon(0 0, ${getCurrentProgress()}% 0, ${getCurrentProgress()}% 100%, 0 100%)`
                          : undefined
                      }}
                    >
                      {isActive && (
                        <>
                          <div 
                            className={`absolute inset-0 opacity-50 blur-sm bg-gradient-to-r ${colors.gradient}`}
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shine_2s_ease-in-out_infinite]" />
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Points Indicators */}
            <div className="flex justify-between mt-1">
              {tiers.map((tier) => (
                <div
                  key={tier.id}
                  className={`text-xs ${
                    currentPoints >= tier.points_threshold
                      ? getTierColors(tier.name).text
                      : 'text-gray-600'
                  }`}
                  style={{
                    width: '20%',
                    textAlign: tier === tiers[0] ? 'left' : tier === tiers[tiers.length - 1] ? 'right' : 'center'
                  }}
                >
                  {tier.points_threshold.toLocaleString()}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-6">
          <h3 className="text-base font-medium text-white mb-4">Current Benefits</h3>
          <div className="space-y-4">
            {currentTierBenefits.map((benefit) => (
              <div 
                key={benefit.id} 
                className={`glass-effect rounded-lg p-4 border ${currentTierColors.border} transition-all duration-300 hover:shadow-[0_0_15px] ${currentTierColors.glow} group`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full ${currentTierColors.bg} group-hover:scale-110 transition-transform`}>
                    <Gift className={`h-4 w-4 ${currentTierColors.icon}`} />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white group-hover:text-gradient transition-colors">
                      {benefit.name}
                    </h4>
                    <p className="text-xs text-gray-400">{benefit.description}</p>
                    {benefit.benefit_type === 'discount' && (
                      <p className={`text-xs font-medium ${currentTierColors.text} mt-1`}>
                        {benefit.value}% off tickets
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}