import { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, Modal, message, Descriptions } from "antd";
import { EyeOutlined, DeleteOutlined } from "@ant-design/icons";
import RegisterMatch from "./RegisterMatch";
import RegisterPhase from "./RegisterPhase";

type Team = {
    id: string;
    name: string;
};

type Match = {
    id: string;
    teamA: Team;
    teamB: Team;
    startDate: string;
    endDate: string;
    goals: string;
};

type Phase = {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
};

const Matches = () => {
    const [matches, setMatches] = useState<Match[]>([]);
    const [phases, setPhases] = useState<Phase[]>([]);
    const [isViewing, setIsViewing] = useState<boolean>(false);
    const [viewingMatch, setViewingMatch] = useState<Match | null>(null);
    const [isRegisteringMatch, setIsRegisteringMatch] = useState<boolean>(false);
    const [isRegisteringPhase, setIsRegisteringPhase] = useState<boolean>(false);

    useEffect(() => {
        fetchMatches();
        fetchPhases();
    }, []);

    const fetchMatches = async () => {
        const tournamentId = localStorage.getItem("selectedTournamentId");
        if (!tournamentId) {
            message.error("No tournament ID found");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: token };
            const response = await axios.get(
                `${process.env.REACT_APP_BASE_URL}/tournaments/${tournamentId}/matches`,
                { headers }
            );
            if (response.status === 200 && response.data.success) {
                setMatches(response.data.data);
            } else {
                message.error("Failed to fetch matches");
            }
        } catch (error) {
            message.error("Error fetching matches");
        }
    };

    const fetchPhases = async () => {
        const tournamentId = localStorage.getItem("selectedTournamentId");
        if (!tournamentId) {
            message.error("No tournament ID found");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: token };
            const response = await axios.get(
                `${process.env.REACT_APP_BASE_URL}/tournaments/${tournamentId}/phases`,
                { headers }
            );
            if (response.status === 200 && response.data.success) {
                setPhases(response.data.data);
            } else {
                message.error("Failed to fetch phases");
            }
        } catch (error) {
            message.error("Error fetching phases");
        }
    };

    const matchColumns = [
        { key: "1", title: "Equipo A", dataIndex: ["teamA", "name"] },
        { key: "2", title: "Equipo B", dataIndex: ["teamB", "name"] },
        { key: "3", title: "Fecha Inicio", dataIndex: "startDate" },
        { key: "4", title: "Goles", dataIndex: "goals" },
        {
            key: "5",
            title: "Acciones",
            render: (record: Match) => (
                <>
                    <EyeOutlined onClick={() => onViewMatch(record)} />
                    <DeleteOutlined
                        onClick={() => onDeleteMatch(record)}
                        style={{ color: "red", marginLeft: 12 }}
                    />
                </>
            ),
        },
    ];

    const phaseColumns = [
        { key: "1", title: "Name", dataIndex: "name" },
        { key: "2", title: "Start Date", dataIndex: "startDate" },
        { key: "3", title: "End Date", dataIndex: "endDate" },
    ];

    const onViewMatch = (record: Match) => {
        setIsViewing(true);
        setViewingMatch(record);
    };

    const onDeleteMatch = (record: Match) => {
        Modal.confirm({
            title: "Are you sure you want to delete this match?",
            okText: "Yes",
            okType: "danger",
            onOk: async () => {
                try {
                    const token = localStorage.getItem("token");
                    const headers = { Authorization: token };
                    const response = await axios.delete(
                        `${process.env.REACT_APP_BASE_URL}/matches/${record.id}`,
                        { headers }
                    );

                    if (response.status === 200) {
                        setMatches((prev) => prev.filter((match) => match.id !== record.id));
                        message.success("Match deleted successfully!");
                    } else {
                        message.error("Failed to delete match");
                    }
                } catch (error) {
                    message.error("Failed to delete match: " + error);
                }
            },
        });
    };

    const onRegisterMatch = () => {
        setIsRegisteringMatch(true);
    };

    const onRegisterPhase = () => {
        setIsRegisteringPhase(true);
    };

    return (
        <div>
            <Button onClick={onRegisterPhase}>Registrar Nueva Fase</Button>
            <div style={{ margin: "2%" }}></div>
            <Table columns={phaseColumns} dataSource={phases} rowKey="id" pagination={false}/>
            <div style={{ margin: "5%" }}></div>
            <Button onClick={onRegisterMatch}>Registrar Nuevo Partido</Button>
            <div style={{ margin: "2%" }}></div>
            <Table columns={matchColumns} dataSource={matches} rowKey="id" />
            <Modal
                title="Detalles del Partido"
                open={isViewing}
                onCancel={() => setIsViewing(false)}
                footer={null}
                width={500}
            >
                {viewingMatch && (
                    <Descriptions bordered column={1}>
                        <Descriptions.Item label="Equipo A">
                            {viewingMatch.teamA.name}
                        </Descriptions.Item>
                        <Descriptions.Item label="Equipo B">
                            {viewingMatch.teamB.name}
                        </Descriptions.Item>
                        <Descriptions.Item label="Fecha de Inicio">
                            {viewingMatch.startDate}
                        </Descriptions.Item>
                        <Descriptions.Item label="Fecha de Fin">
                            {viewingMatch.endDate}
                        </Descriptions.Item>
                        <Descriptions.Item label="Goles">{viewingMatch.goals}</Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>
            <Modal
                title="Registrar Nueva Fase"
                open={isRegisteringPhase}
                footer={null}
                onCancel={() => setIsRegisteringPhase(false)}
                width={500}
            >
                <RegisterPhase
                    onClose={() => {
                        setIsRegisteringPhase(false);
                        fetchPhases();
                    }}
                />
            </Modal>
            <Modal
                title="Registrar Nuevo Partido"
                open={isRegisteringMatch}
                footer={null}
                onCancel={() => setIsRegisteringMatch(false)}
                width={500}
                >
                    <RegisterMatch
                        onClose={() => {
                            setIsRegisteringMatch(false);
                            fetchMatches();
                        }}
                    />
                </Modal>
            </div>
        );
    };
    
    export default Matches;
    
