import { Inject, Injectable, NotFoundException } from "@nestjs/common";

import { CreateNfcTagDto } from "../../../../libs/contracts/src/nfc-tags/dto/create-nfc-tag.dto";
import { UpdateNfcTagDto } from "../../../../libs/contracts/src/nfc-tags/dto/update-nfc-tag.dto";
import {
  PRESENCE_PRISMA,
  PresencePrismaClient,
} from "../prisma/prisma.constants";

@Injectable()
export class NfcTagsService {
  constructor(
    @Inject(PRESENCE_PRISMA)
    private readonly prisma: PresencePrismaClient,
  ) {}

  async create(createNfcTagDto: CreateNfcTagDto) {
    return await this.prisma.nfcTag.create({
      data: {
        uid: createNfcTagDto.uid,
        name: createNfcTagDto.name,
        companyId: createNfcTagDto.companyId,
        aesKey: createNfcTagDto.aesKey,
      },
    });
  }

  async findAllForCompany(companyId: number) {
    return await this.prisma.nfcTag.findMany({
      where: { companyId },
      orderBy: { name: "asc" },
    });
  }

  async findOneForCompany(id: number, companyId: number) {
    const tag = await this.prisma.nfcTag.findFirst({
      where: { id, companyId },
    });

    if (tag == null) {
      throw new NotFoundException(`NFC tag ${String(id)} not found`);
    }

    return tag;
  }

  async update(id: number, companyId: number, updateDto: UpdateNfcTagDto) {
    await this.ensureOwnership(id, companyId);

    return await this.prisma.nfcTag.update({
      where: { id },
      data: {
        name: updateDto.name,
        uid: updateDto.uid,
        aesKey: updateDto.aesKey,
      },
    });
  }

  async remove(id: number, companyId: number) {
    await this.ensureOwnership(id, companyId);

    await this.prisma.nfcTag.delete({
      where: { id },
    });
  }

  async findByUid(uid: string) {
    return await this.prisma.nfcTag.findUnique({ where: { uid } });
  }

  private async ensureOwnership(id: number, companyId: number) {
    const tag = await this.prisma.nfcTag.findUnique({ where: { id } });

    if (tag?.companyId !== companyId) {
      throw new NotFoundException(`NFC tag ${String(id)} not found`);
    }
  }
}
