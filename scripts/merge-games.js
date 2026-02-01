const fs = require('fs');
const path = require('path');

// قراءة الملفات
const oldGamesPath = path.join(__dirname, '../src/data/educational-games.json');
const newGamesPath = path.join(__dirname, '../src/data/chemical-physics-games.json');

const oldGames = JSON.parse(fs.readFileSync(oldGamesPath, 'utf8'));
const newGames = JSON.parse(fs.readFileSync(newGamesPath, 'utf8'));

// تحويل الألعاب الجديدة إلى التنسيق القديم
const converted = newGames.games.map(g => {
  let difficulty = g.difficulty_num;
  if (!difficulty) {
    if (g.difficulty === 'easy') difficulty = 1;
    else if (g.difficulty === 'medium') difficulty = 2;
    else if (g.difficulty === 'hard') difficulty = 3;
    else difficulty = 2;
  }
  
  return {
    game_id: g.game_id,
    chapter: g.chapter,
    title: g.game_title,
    game_type: g.game_type,
    learning_indicator: g.learning_outcome || g.nafs_indicator,
    objective: g.objective,
    level: g.level,
    difficulty: difficulty,
    remedial: g.remedial,
    points: g.points
  };
});

// دمج الألعاب
const merged = {
  ...oldGames,
  games: [...oldGames.games, ...converted]
};

// كتابة الملف المدمج
fs.writeFileSync(oldGamesPath, JSON.stringify(merged, null, 2), 'utf8');

console.log(`✅ تم دمج ${converted.length} لعبة جديدة في educational-games.json`);
console.log(`📊 إجمالي الألعاب: ${merged.games.length}`);
