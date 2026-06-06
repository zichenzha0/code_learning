// 终幕·顺平侯 — 综合毕业项目
export const ACT_FINAL = {
  id: 'ch11', name: '终幕·顺平侯', emoji: '👑', color: '#7A5A10',
  subtitle: '229年，追谥顺平侯，功名永垂',
  blurb: '建兴七年，赵云病逝，追谥"顺平侯"。柔贤慈惠曰顺，执事有班曰平——功名永垂！写下你的赵云生涯总结。',
  missions: [
    { id: 'af-m1', title: '总结兵法——综合讲解', emoji: '📖' },
    { id: 'af-boss', title: '毕业项目·赵云生涯大结算', emoji: '👑' },
  ],
  steps: [
    {
      id: 'af-t1', type: 'teach', topicId: null, missionId: 'af-m1',
      title: '综合项目——赵云生涯',
      blurb: '把所有学过的知识拼在一起，写一个完整的"赵云生涯"结算程序。',
      syntax: '# 综合用到：\n# 变量 / 字符串 / 列表 / 字典\n# for 循环 / if 判断\n# 函数 def / lambda\n# try/except（可选）\n# class（可选）',
      example: 'def get_title(merit):\n    if merit >= 300:\n        return "顺平侯"\n    elif merit >= 200:\n        return "虎威将军"\n    else:\n        return "翊军将军"\n\nbattles = {"长坂": 100, "汉水": 150}\ntotal = sum(battles.values())\nprint(f"总战功：{total}")\nprint(get_title(total))',
      output: '总战功：250\n虎威将军',
      note: '顺平，谥法：柔贤慈惠曰顺，执事有班曰平。赵云的谥号，是对他一生最好的总结。',
      related: [],
      story: '建兴七年，赵云病逝。一生戎马，忠义无双——写下他的生涯吧。',
    },
    {
      id: 'af-p1', type: 'project', topicId: null, missionId: 'af-boss',
      title: '赵云生涯大结算',
      brief: '综合运用本游戏所有知识点，写一个战功结算程序。',
      requirements: [
        '定义字典 battles 包含至少 3 场战役和对应战功值（整数）',
        '用 for 循环打印每场战役名和战功',
        '计算总战功 total = sum(battles.values())',
        '打印 f"赵云总战功：{total}"',
        '定义函数 get_title(total)：total >= 300 返回"顺平侯"，否则返回"将军"',
        '打印 get_title(total) 的返回值',
      ],
      starter: '# 赵云生涯大结算\n\n# 1. 定义战役字典\nbattles = {\n    "长坂坡": 100,\n    "汉水之战": 150,\n    "箕谷断后": 80,\n}\n\n# 2. 循环打印每场战役\nfor name, merit in battles.items():\n    print(f"{name}：{merit} 战功")\n\n# 3. 计算并打印总战功\ntotal = sum(battles.values())\nprint(f"赵云总战功：{total}")\n\n# 4. 定义 get_title 函数\ndef get_title(total):\n    if total >= 300:\n        return "顺平侯"\n    else:\n        return "将军"\n\n# 5. 打印称号\nprint(get_title(total))\n',
      test: 'assert isinstance(battles, dict) and len(battles) >= 3, "battles 字典需要至少 3 场战役"\nassert all(isinstance(v, (int, float)) for v in battles.values()), "战功值需为数字"\nassert callable(get_title), "需要定义 get_title 函数"\ntotal_check = sum(battles.values())\nresult = get_title(total_check)\nassert isinstance(result, str) and len(result) > 0, "get_title 需要返回字符串"\nprint("生涯结算完毕！")',
      reward: '顺平侯！赵云一生功勋铸就，威名永垂不朽！\n恭喜你完成了常山赵子龙的全部征途——Python 兵法，尽在掌中！\n"以忠贞之性，吐诚之行，感动华夷，著于来世。"',
    },
  ],
}
