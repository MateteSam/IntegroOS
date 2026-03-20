from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import logging
import time

from agent_core import agent_orchestrator
from utils import handle_errors

logger = logging.getLogger(__name__)

agent_bp = Blueprint('agent_routes', __name__, url_prefix='/api/agents')

@agent_bp.route('/execute', methods=['POST'])
@jwt_required()
@handle_errors
def execute_workflow():
    """
    Triggers an autonomous workflow execution.
    In a fully set up system, this will dispatch a Celery task.
    For now, it acts as the entry point to the Python orchestration engine.
    """
    user_id = int(get_jwt_identity())
    data = request.json
    
    workflow_id = data.get('workflow_id', 'unknown')
    steps = data.get('steps', [])
    initial_context = data.get('initial_context', '')
    
    logger.info(f"Received workflow execution request for workflow {workflow_id} by user {user_id}")
    
    # Try to import celery dynamically to dispatch the task safely
    try:
        from app import celery
        if celery:
            # Dispatch as a background task
            task = run_workflow_background.delay(user_id, workflow_id, steps, initial_context)
            return jsonify({
                "message": "Workflow started in background",
                "task_id": task.id,
                "workflow_id": workflow_id
            }), 202
    except ImportError:
        pass

    # Fallback to synchronous execution if Celery isn't up
    return jsonify({
        "message": "Celery not active, synchronous execution not supported yet to prevent timeouts."
    }), 503

# Define the Celery Task here or in a separate tasks.py
# Using a local import to avoid circular dependency
def init_celery_tasks(celery_app, socketio_app):
    @celery_app.task(bind=True)
    def run_workflow_background(self, user_id, workflow_id, steps, initial_context):
        """
        The relentless background execution loop.
        """
        logger.info(f"Starting Celery workflow task {self.request.id} for user {user_id}")
        
        current_context = initial_context
        results = []
        
        for step in steps:
            # Emit status via WebSocket indicating step start
            socketio_app.emit('workflow_status', {
                'workflow_id': workflow_id,
                'status': 'processing',
                'step': step['agentName'],
                'message': f"Agent {step['agentName']} is starting..."
            }, room=f'user_{user_id}')
            
            # Execute the step using LangChain/Backend Engine
            step_result = agent_orchestrator.execute_workflow_step(step, current_context, user_id, workflow_id)
            
            # Artificial delay to simulate deep "thinking"
            time.sleep(2)
            
            # Emit result
            socketio_app.emit('workflow_step_complete', {
                'workflow_id': workflow_id,
                'step_result': step_result
            }, room=f'user_{user_id}')
            
            # Chain the context forward
            current_context += f"\nResult of {step['agentName']}: {step_result['result_text']}"
            results.append(step_result)
            
        # Final Completion
        socketio_app.emit('workflow_complete', {
            'workflow_id': workflow_id,
            'summary': f"Completed {len(steps)} steps successfully.",
            'final_context': current_context
        }, room=f'user_{user_id}')
        
        return {"status": "success", "steps_completed": len(steps)}

    # We will initialize this in app.py
    return run_workflow_background
