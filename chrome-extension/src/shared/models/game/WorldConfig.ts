export interface WorldConfig {
  script: {
    src: string;
  };
  speed: number;
  unit_speed: number;
  moral: number;
  premium: {
    free_Premium: number;
    free_Premium_intervals: string;
    AccountManager: number;
    AccountManager_Premium_needed: number;
    ItemNameColor: number;
    free_AccountManager: number;
    free_AccountManager_intervals: string;
    BuildTimeReduction: number;
    BuildTimeReduction_percentage: number;
    BuildInstant: number;
    BuildInstant_free: number;
    BuildCostReduction: number;
    FarmAssistent: number;
    MerchantBonus: number;
    ProductionBonus: number;
    NoblemanSlot: number;
    MerchantExchange: number;
    MerchantExchange_ratio: number;
    PremiumExchange: number;
    KnightBookImprove: number;
    KnightBookDowngrade: number;
    KnightBookReroll: number;
    KnightRespec: number;
    KnightRecruitTime: number;
    KnightRecruitInstant: number;
    KnightReviveTime: number;
    KnightReviveInstant: number;
    KnightTrainingCost: number;
    KnightTrainingTime: number;
    KnightTrainingInstant: number;
    DailyBonusUnlock: number;
    ScavengingSquadLoot: number;
    PremiumEventFeatures: number;
    PremiumRelicFeatures: number;
  };
  awards: {
    available: number;
    milestones_available: number;
    AwardDailyKillsAttacker_lead_time: string;
    AwardDailyKillsDefender_lead_time: string;
    AwardDailyKillsSupporter_lead_time: string;
    AwardDailyLootResources_lead_time: string;
    AwardDailyScavengeResources_lead_time: string;
    AwardDailyLootVillages_lead_time: string;
    AwardDailyVillageCount_lead_time: string;
    AwardHighscoreCont_lead_time: string;
    AwardHighscoreGlobal_lead_time: string;
  };
  build: {
    destroy: number;
  };
  misc: {
    kill_ranking: number;
    tutorial: number;
    trade_cancel_time: number;
  };
  commands: {
    millis_arrival: number;
    attack_gap: number;
    support_gap: number;
    command_cancel_time: number;
  };
  newbie: {
    days: number;
    ratio_days: number;
    ratio: number;
    removeNewbieVillages: number;
  };
  game: {
    buildtime_formula: number;
    knight: number;
    knight_new_items?: string;
    knight_archer_bonus: number;
    archer: number;
    tech: number;
    farm_limit: number;
    church: number;
    watchtower: number;
    stronghold: number;
    fake_limit: number;
    barbarian_rise: number;
    barbarian_shrink: number;
    barbarian_max_points: number;
    scavenging: number;
    hauls: number;
    hauls_base: number;
    hauls_max: number;
    base_production: number;
    event: number;
    suppress_events: number;
    relics?: string;
  };
  buildings: {
    custom_main: number;
    custom_farm: number;
    custom_storage: number;
    custom_place: number;
    custom_barracks: number;
    custom_church: number;
    custom_smith: number;
    custom_wood: number;
    custom_stone: number;
    custom_iron: number;
    custom_market: number;
    custom_stable: number;
    custom_wall: number;
    custom_garage: number;
    custom_hide: number;
    custom_snob: number;
    custom_statue: number;
    custom_watchtower: number;
  };
  snob: {
    gold: number;
    cheap_rebuild: number;
    rise: number;
    max_dist: number;
    factor: number;
    coin_wood: number;
    coin_stone: number;
    coin_iron: number;
    no_barb_conquer?: string;
  };
  ally: {
    no_harm: number;
    no_other_support: number;
    no_other_support_type: number;
    allytime_support: number;
    allytime_support_type: number;
    no_leave: number;
    no_join: number;
    limit: number;
    fixed_allies: number;
    wars_member_requirement: number;
    wars_points_requirement: number;
    wars_autoaccept_days: number;
    auto_lock_tribes: number;
    auto_lock_dominance_percentage: number;
    auto_lock_days: number;
    levels: number;
    xp_requirements: string;
  };
  coord: {
    map_size: number;
    func: number;
    empty_villages: number;
    bonus_villages: number;
    inner: number;
    select_start: number;
    village_move_wait: number;
    noble_restart: number;
    start_villages: number;
  };
  sitter: {
    allow: number;
    illegal_time: number;
    max_sitting: number;
  };
  sleep: {
    active: number;
    delay: number;
    min: number;
    max: number;
    min_awake: number;
    max_awake: number;
    warn_time: number;
  };
  night: {
    active: number;
    start_hour: number;
    end_hour: number;
    def_factor: number;
    duration: number;
  };
  mood: {
    loss_max: number;
    loss_min: number;
    load: number;
  };
  win: {
    check: number;
    give_prizes: number;
  };
  points_villages_win: {
    points: number;
    villages: number;
    hours: number;
  };
  dominance_win: {
    status: number;
    domination_warning: number;
    world_age_warning: number;
    domination_endgame: number;
    world_age_endgame: number;
    holding_period_days: number;
    domination_reached_at: number;
    victory_reached_at: number;
  };
  runes_win: {
    spawning_delay: number;
    spawn_villages_per_continent: number;
    win_percentage: number;
    hold_time: number;
    disable_morale: number;
  };
  siege_win: {
    villages: number;
    required_points: number;
    check_days: number;
    minimum_world_age: number;
    reduction_percentage: number;
    reduction_max_percentage: number;
    disable_morale: number;
  };
  casual: {
    transfer_to: string;
    attack_block?: string;
    attack_block_max: number;
    block_noble?: string;
    disabled_restart_deadline: number;
    automation_version: number;
    automation_start_after: string;
    automation_change_interval: string;
  };
}