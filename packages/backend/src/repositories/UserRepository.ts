import { injectable } from "tsyringe";
import { Op, Sequelize } from "sequelize";
import { User } from "../models/User";
import { cpfDigitsColumn, cpfMatches, normalizeCpf } from "../utils/cpf";

@injectable()
export default class UserRepository {
  findByEmail(email: string): Promise<User | null> {
    return User.findOne({ where: { email } });
  }

  findByCpf(cpf: string): Promise<User | null> {
    const digits = normalizeCpf(cpf);
    if (digits.length !== 11 || digits === "00000000000") {
      return Promise.resolve(null);
    }
    return User.findOne({
      where: cpfMatches(cpf, "User.cpf"),
    });
  }

  findByCpfs(cpfs: string[]): Promise<User[]> {
    const digits = [
      ...new Set(
        cpfs.map(normalizeCpf).filter((d) => d.length === 11)
      ),
    ];
    if (digits.length === 0) return Promise.resolve([]);
    return User.findAll({
      where: Sequelize.where(cpfDigitsColumn("User.cpf"), {
        [Op.in]: digits.map((d) => normalizeCpf(d)),
      }),
    });
  }

  findById(id: number): Promise<User | null> {
    return User.findByPk(id);
  }

  create(data: {
    name: string;
    email: string;
    cpf: string;
    password: string;
  }): Promise<User> {
    return User.create(data);
  }
}
