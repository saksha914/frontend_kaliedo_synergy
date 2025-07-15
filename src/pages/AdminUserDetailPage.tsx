import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { adminAPI } from "../utils/api.ts";
import { Card } from "../components/Card.tsx";
import LoadingSpinner from "../components/LoadingSpinner.tsx";
import { Button } from "../components/Button.tsx";
import { Question } from "../types/index.ts";
import { assessmentAPI } from "../utils/api.ts";

const LIKERT_LABELS: Record<number, string> = {
  5: "Strongly Agree",
  4: "Agree to Some Extent",
  3: "Neutral / Maybe",
  2: "Disagree to Some Extent",
  1: "Strongly Disagree",
};

const AdminUserDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<any>(null);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const users = await adminAPI.listUsers();
        const foundUser = users.find((u: any) => u.id === id);
        setUser(foundUser);
        const userAssessments = await adminAPI.getUserAssessments(id);
        setAssessments(userAssessments);
        const allQuestions = await assessmentAPI.getQuestions();
        // Ensure questions is always an array
        if (Array.isArray(allQuestions)) {
          setQuestions(allQuestions);
        } else if (allQuestions && Array.isArray(allQuestions.questions)) {
          setQuestions(allQuestions.questions);
        } else {
          setQuestions([]);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <LoadingSpinner size="lg" />;
  if (!user) return <div className="p-8 text-center">User not found</div>;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <Button onClick={() => navigate(-1)} variant="outline" className="mb-4">Back</Button>
      <Card>
        <h2 className="font-bold text-xl mb-2">{user.username} ({user.full_name})</h2>
        <div className="mb-2 text-sm text-gray-500">Company: {user.company} | Position: {user.position}</div>
        <div className="mb-4 text-xs text-gray-400">Joined: {user.created_at && new Date(user.created_at).toLocaleString()}</div>
        <h3 className="font-semibold mb-2">Assessments</h3>
        {assessments.length === 0 ? (
          <div className="text-gray-500">No assessments found.</div>
        ) : (
          assessments.map((a) => (
            <Card key={a.id} className="mb-4 bg-gray-50">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Score: {a.total_score}</span>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    a.overall_rating === 'exemplary' ? 'bg-green-100 text-green-700' :
                    a.overall_rating === 'critical' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {a.overall_rating}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  Started: {a.started_at && new Date(a.started_at).toLocaleString()}<br />
                  Completed: {a.completed_at && new Date(a.completed_at).toLocaleString()}<br />
                  Time: {a.total_time_minutes} min
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {a.domain_scores && Object.entries(a.domain_scores).map(([domain, score]) => (
                    <span key={domain} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                      {domain}: {score}
                    </span>
                  ))}
                </div>
                <div className="mt-2">
                  <h4 className="font-semibold mb-1">Responses</h4>
                  {(a.responses && a.responses.length > 0) ? (
                    <table className="min-w-full text-xs border">
                      <thead>
                        <tr>
                          <th className="border px-2 py-1">#</th>
                          <th className="border px-2 py-1">Question</th>
                          <th className="border px-2 py-1">Domain</th>
                          <th className="border px-2 py-1">Response</th>
                        </tr>
                      </thead>
                      <tbody>
                        {a.responses.map((resp, idx) => {
                          const q = questions.find(q => q.id === resp.question_id);
                          return (
                            <tr key={resp.question_id}>
                              <td className="border px-2 py-1">{idx + 1}</td>
                              <td className="border px-2 py-1">{q ? q.question_text : resp.question_id}</td>
                              <td className="border px-2 py-1">{resp.domain}</td>
                              <td className="border px-2 py-1">{LIKERT_LABELS[resp.response] || resp.response}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-gray-400">No responses recorded.</div>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </Card>
    </div>
  );
};

export default AdminUserDetailPage; 