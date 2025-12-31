/**
 * AI Prompt Templates for Plotline
 * 
 * These templates are used for AI-based story extraction and analysis.
 */

export const PROMPTS = {
  /**
   * Extract timeline from narrative text
   * Separates narration order from chronological order
   */
  TIMELINE_EXTRACTION: {
    system: `あなたは物語の時系列分析者です。物語テキストから出来事を抽出し、それらを時系列順に並べ替えてください。

重要: 物語では過去の出来事が回想として後から語られることがあります。
あなたの仕事は「叙述順序」と「時系列順序」を区別することです。`,

    user: (text: string, language: 'ja' | 'en' = 'ja') => language === 'ja'
      ? `以下の物語テキストを分析してください。

【物語テキスト】
${text}

【出力形式】
以下のJSON形式で出力してください:

{
  "characters": [
    {
      "name": "キャラクター名",
      "initial_location": "最初にいる場所",
      "initial_state": { "mood": "状態" },
      "inventory": ["所持品"]
    }
  ],
  "events": [
    {
      "who": "誰が",
      "what": "何をした",
      "where": "どこで",
      "dialogue": "セリフ（あれば）",
      "state_change": { "mood": "変化後の状態" },
      "item_changes": { "add": ["得たアイテム"], "remove": ["失ったアイテム"] },
      "knowledge_changes": { "add": ["新しく知った情報"] },
      "narrative_position": 1,
      "estimated_time": "時間の目安（例: '5年前', '翌日', '同日夜'）",
      "source_text": "この出来事が書かれている原文の一部"
    }
  ],
  "connections": [
    {
      "from_event": 1,
      "to_event": 2,
      "type": "causes | enables | triggers | leads_to",
      "description": "なぜこの関係があるか"
    }
  ]
}

【ルール】
1. events配列は時系列順に並べること（配列の順番 = 時間の順番）
2. narrative_position: テキスト内で語られた順番（1から開始）
3. estimated_time: 相対的な時間でOK（例: "5年前", "翌日"）
4. connections: 異なるキャラクター間の因果関係を抽出
   - from_event/to_event: narrative_positionの値
   - type: causes=直接的原因, enables=可能にする, triggers=きっかけ, leads_to=結果として
5. state_change: 心情や状態が変化した場合に記載
6. item_changes: アイテムを得た/失った場合に記載
7. knowledge_changes: 新しい情報を知った場合に記載`


      : `Analyze the following story text.

【Story Text】
${text}

【Output Format】
Output in the following JSON format:

{
  "characters": [
    {
      "name": "Character name",
      "initial_location": "Starting location",
      "initial_state": { "mood": "state" },
      "inventory": ["items"]
    }
  ],
  "events": [
    {
      "who": "Who",
      "what": "Did what",
      "where": "Where",
      "dialogue": "Dialogue (if any)",
      "state_change": { "mood": "changed state" },
      "item_changes": { "add": ["gained items"], "remove": ["lost items"] },
      "knowledge_changes": { "add": ["new information"] },
      "narrative_position": 1,
      "estimated_time": "Time reference (e.g., '5 years ago', 'next day')",
      "source_text": "Excerpt from original text"
    }
  ],
  "connections": [
    {
      "from_event": 1,
      "to_event": 2,
      "type": "causes | enables | triggers | leads_to",
      "description": "Why this relationship exists"
    }
  ]
}

【Rules】
1. events array must be in chronological order (array order = time order)
2. narrative_position: Order in which events are narrated (starting from 1)
3. estimated_time: Relative time is OK (e.g., "5 years before main events")
4. connections: Extract causal relationships between different characters
5. state_change: Record mood/state changes if any
6. item_changes: Record items gained/lost if any
7. knowledge_changes: Record new information learned if any`,
  },

  /**
   * Check for contradictions in the story
   */
  VALIDATION: {
    system: `あなたは物語の整合性チェッカーです。物語内の矛盾を見つけてください。`,

    user: (storyJson: string) => `以下のストーリーデータの矛盾をチェックしてください。

${storyJson}

以下の観点でチェック:
1. 位置の矛盾: キャラクターが移動なしに別の場所にいる
2. アイテムの矛盾: 持っていないアイテムを使う
3. 時系列の矛盾: 過去の出来事が未来より後に設定されている
4. 状態の矛盾: 説明なく状態が変化している

JSON形式で出力:
{
  "issues": [
    {
      "type": "location | inventory | timeline | state",
      "severity": "error | warning | info",
      "message": "問題の説明",
      "event_ids": ["関連するイベントID"],
      "suggestion": "修正案"
    }
  ]
}`,
  },

  /**
   * Generate narrative from sequence
   */
  GENERATE_NARRATIVE: {
    system: `あなたはプロの物語作家です。与えられたイベントリストから魅力的な物語を書いてください。`,

    user: (storyJson: string, style: 'fairytale' | 'novel' | 'screenplay' = 'novel') => {
      const styleGuide = {
        fairytale: '童話調（むかしむかし〜）で、子供にもわかりやすく',
        novel: '小説調で、登場人物の心情を丁寧に描写',
        screenplay: 'シナリオ形式で、場面転換と台詞を明確に',
      };

      return `以下のイベントリストを元に物語を書いてください。

【スタイル】${styleGuide[style]}

【イベントデータ】
${storyJson}

【ルール】
1. イベントは時系列順に並んでいます
2. flashbackのイベントは回想シーンとして自然に組み込んでください
3. dialogueがあるイベントは必ずセリフを含めてください
4. キャラクターの状態変化(state_change)を自然に描写してください`;
    },
  },
};

export type PromptKey = keyof typeof PROMPTS;
