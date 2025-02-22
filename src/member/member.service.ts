import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { MemberVoting } from 'src/dto/member-voting';
import { Member } from 'src/entities/member.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    private readonly jwtService: JwtService,
  ) {}

  async getMemberByEmail(email: string) {
    try {
      const member = await this.memberRepository.findOne({ where: { email } });
      return member;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async saveMember(memberVoting: MemberVoting): Promise<MemberVoting> {
    const token = this.jwtService.sign({ email: memberVoting.email });

    const member = this.memberRepository.create({
      email: memberVoting.email,
      is_voted: memberVoting.is_voted,
      token,
    });

    return this.memberRepository.save(member);
  }
}
