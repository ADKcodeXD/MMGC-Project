import type { MemberVo } from '~~/types/member.type'

export interface CommentModel {
  commentId: number
  content: string // 评论内容
  createTime: number // 评论时间
  movieId: number // 评论的电影id
  memberId: number // 评论人id
  toMemberId: number | null
  parentId: number | null
}

export interface CommentVo extends Omit<CommentModel, 'memberId' | 'toMemberId' | 'createTime'> {
  memberVo?: MemberVo | null
  toMemberVo?: MemberVo | null
  createTime: string
  children: Array<CommentVo>
}

export interface CommentParams {
  content: string
  movieId: number
  toMemberId?: number
  parentId?: number
}
