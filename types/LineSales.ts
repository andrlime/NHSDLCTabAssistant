// 队伍编号 个人编号	分组	姓名 (汉字）	姓名的拼音	性别	电子邮件	联系电话	学校	年级	家长联系电话	Team Awards	Individual Award	Team rank	Prelim Wins	Prelim Losses	Speaker rank
export type LineSales = {
    teamCode: number, // get from team line D
    indivCode: number, // get from team line, i.e. find speaker 1 and speaker 2 id, and then search the speaker list
    division: string, // get from list items D
    chineseName: string,
    pinyinName: string,
    gender: string,
    email: string,
    phone: string,
    school: string,
    gradeLevel: string,
    parentPhone: string,
    teamAwards: string, // get from team string D
    indivAwards: string, // get from speakers string D
    teamRank: number, // team string D
    indivRank: number, // speakers string D
    prelimWins: number, // count Ws and Rds in the speaker thingy D
    prelimLosses: number // see above D
}; // type of a single line in the sheet

export default LineSales;