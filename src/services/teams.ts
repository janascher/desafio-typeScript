import { Services } from './service';
import { PatchData, TeamData } from '../models';
import { NameValidator, UUIDValidator } from '../validator/string';

export class TeamServices extends Services {    
    public async getAllTeams()
    {
        const client = await this.repository.connect(); 
        try {
            const getTeams = await this.repository.getAllTeams(client);
            this.repository.release(client);
            return getTeams;
        } catch (error) {
            this.repository.release(client);
            return {'status': 500, 'error': 'erro buscando Teams'};
        }

    } 

    public async getTeam(teamId : string)
    {
        const client = await this.repository.connect(); 
        try {
            const getTeam = await this.repository.getTeamById(client, teamId);
            this.repository.release(client);
            return getTeam;
        } catch (error) {
            this.repository.release(client);
            return {'status': 500, 'error': 'erro buscando Team'};
        }
    } 

    public async getTeamLeader(teamId : string)
    {
        const client = await this.repository.connect(); 
        try {
            const teamLeader = await this.repository.getTeamLeader(client, teamId);
            this.repository.release(client);
            return teamLeader;
        } catch (error) {
            this.repository.release(client);
            return {'status': 500, 'error': 'erro buscando Team Leader'};
        }
    }    

    public async deleteTeamMember(userId : string, teamId : string)
    {
        const client = await this.repository.connect(); 
        try {
            const delMember = await this.repository.deleteTeamMember(client, userId, teamId);
            this.repository.release(client);
            return delMember;
        } catch (error) {
            this.repository.release(client);
            return {'status': 500, 'error': 'erro excluindo Member'};
        }
    }    


    public async createNewTeam(userType: boolean, teamId: string, teamData: TeamData)
    {
        const client = await this.repository.connect();
        try {
            // this.repository.begin(client);
            const is_admin = userType
            if (is_admin) {
                const newTeamData = await this.repository.createTeamQuery(client, teamId, teamData);
                this.repository.release(client);
                return newTeamData
            } else {
                throw new Error(`Apenas Usuários Administradores podem criar Equipes!`)
            }
            // this.repository.commit(client);
        } catch (error) {
            this.repository.release(client);
            return {'status': 500, 'error': error};
        }
    }

    public async addNewTeamMember(userType: boolean, team_id: string, user_id: string)
    {
        const client = await this.repository.connect();
        try {
            // this.repository.begin(client);
            const is_admin = userType
            if (is_admin) {
                const teamMemberAddedData = await this.repository.addNewTeamMemberQuery(client, team_id, user_id);
                this.repository.release(client);
                return teamMemberAddedData
            } else {
                throw new Error(`Erro: usuário não adicionado na equipe!`)
            }
            // this.repository.commit(client);
        } catch (error) {
            this.repository.release(client);
            return {'status': 500, 'error': error};
        }
    }

    public async update(param: PatchData<TeamData>)
    {
        const client = await this.repository.connect();
        try {
            const columnsArray = ['updated_at']
            const values : any[] = [param.id, 'now()']

            if (param.data.leader) {
                const valLeader = new UUIDValidator(param.data.leader)
                columnsArray.push('leader')
                values.push(param.data.leader)
            }
            if (param.data.name) {
                const valName = new NameValidator(param.data.name)
                columnsArray.push('name')
                values.push(param.data.name)
            }

            let columns = `${columnsArray[0]}`
            let references = `$2`
            for (let i = 1; i < columnsArray.length; i++) {
                columns = columns.concat(`, ${columnsArray[i]}`);
                references = references.concat(`, $${i + 2}`);
            };

            const updateData  = {
                columns,
                references,
                values
            }

            const updatedTeam = await this.repository.patch(client, this.tableName, updateData)
            this.repository.release(client);
            return { 'error': null }
        } catch (error) {
            this.repository.release(client);
            return {'status': 500, 'error': 'Erro ao atualizar time'}
        }
    }
}