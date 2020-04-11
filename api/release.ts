import { NowRequest, NowResponse } from "@now/node";
import fetcher from "../utils/fetcher";

enum ActionType {
  PUBLISHED = "published",
  UNPUBLISHED = "unpublished",
  CREATED = "created",
  edited = "edited",
  deleted = "deleted",
  prereleased = "prereleased",
}

export default function (req: NowRequest, res: NowResponse) {
  const { action, release, repository } = req.body;
  console.log(action, release, repository);
  if (action === ActionType.PUBLISHED) {
    const { url, tag_name, name, author, body, created_at } = release;
    const { name: repoName } = repository;

    const text = `
:rocket: *${created_at.slice(0, 10)} 배포 공유*

*[레포지토리]*
${repoName}
*[제목]*
<${url}|${name}>
*[버전 태그]*
${tag_name}
*[배포 내용]*
${body}
*[담당자]*
${author.login}
`;
    return fetcher
      .post(
        "/chat.postMessage",
        {
          token: process.env.SLACK_BOT_AUTH_TOKEN,
          channel: "#correct-code-release",
          text,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.SLACK_BOT_AUTH_TOKEN}`,
          },
        }
      )
      .then((slackRes) => {
        const { ok, message, error } = slackRes.data;
        if (ok) {
          return res.status(200).json(message);
        }
        return res.status(500).send(`error: ${error}`);
      });
  }
  return res.status(400).send("Not supported release type");
}
