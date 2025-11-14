from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# API Configuration
OPENFDA_API_BASE = "https://api.fda.gov"

# Cache for storing alerts
alerts_cache = []

def get_drug_shortages(search_term=None, limit=100):
    """Fetch drug shortages from OpenFDA - Note: This endpoint might not exist or have limited data"""
    url = f"{OPENFDA_API_BASE}/drug/shortages.json"
    
    params = {"limit": limit}
    
    if search_term:
        # Try searching in multiple fields
        params["search"] = search_term
    
    try:
        response = requests.get(url, params=params, timeout=10)
        
        if response.status_code == 404:
            print("Drug shortages endpoint not found or no results")
            return {"results": []}
        
        if not response.ok:
            print(f"OpenFDA error: {response.status_code} - {response.text}")
            return {"results": []}
        
        return response.json()
    except Exception as e:
        print(f"OpenFDA Shortages API error: {e}")
        return {"results": []}

def get_drug_recalls(search_term=None, limit=100):
    """Fetch drug recalls from OpenFDA"""
    url = f"{OPENFDA_API_BASE}/drug/enforcement.json"
    
    params = {"limit": limit}
    
    # Get recent recalls from last year
    one_year_ago = (datetime.now() - timedelta(days=365)).strftime("%Y%m%d")
    current_date = datetime.now().strftime("%Y%m%d")
    
    search_queries = [f"report_date:[{one_year_ago}+TO+{current_date}]"]
    
    if search_term:
        search_queries.append(f'product_description:"{search_term}"')
    
    params["search"] = "+AND+".join(search_queries)
    
    try:
        response = requests.get(url, params=params, timeout=10)
        
        if response.status_code == 404:
            return {"results": []}
        
        if not response.ok:
            print(f"OpenFDA Recalls error: {response.status_code}")
            return {"results": []}
        
        return response.json()
    except Exception as e:
        print(f"OpenFDA Recalls API error: {e}")
        return {"results": []}

@app.route('/api/test/shortages', methods=['GET'])
def test_shortages():
    """Test endpoint to see raw OpenFDA shortage data"""
    try:
        shortage_data = get_drug_shortages(limit=5)
        recall_data = get_drug_recalls(limit=5)
        
        return jsonify({
            'success': True,
            'shortage_data': shortage_data,
            'recall_data': recall_data,
            'note': 'Raw data from OpenFDA endpoints'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/hospitals', methods=['GET'])
def get_hospitals():
    """Get hospital bed availability data (mock data)"""
    try:
        district = request.args.get('district', '')
        
        # Mock hospital data
        hospitals = [
            {
                'id': 1,
                'name': 'City General Hospital',
                'district': 'Mumbai',
                'state': 'Maharashtra',
                'totalBeds': 150,
                'availableBeds': 45,
                'icuBeds': 20,
                'availableIcu': 3,
                'contact': '+91-22-1234-5678',
                'address': '123 Medical Street, Mumbai, Maharashtra 400001',
                'lastUpdated': (datetime.now() - timedelta(minutes=5)).isoformat()
            },
            {
                'id': 2,
                'name': 'Regional Medical Center',
                'district': 'Delhi',
                'state': 'Delhi',
                'totalBeds': 200,
                'availableBeds': 12,
                'icuBeds': 30,
                'availableIcu': 1,
                'contact': '+91-11-2345-6789',
                'address': '456 Health Avenue, New Delhi, Delhi 110001',
                'lastUpdated': (datetime.now() - timedelta(minutes=10)).isoformat()
            },
            {
                'id': 3,
                'name': 'Metro Hospital',
                'district': 'Bangalore',
                'state': 'Karnataka',
                'totalBeds': 100,
                'availableBeds': 60,
                'icuBeds': 15,
                'availableIcu': 8,
                'contact': '+91-80-3456-7890',
                'address': '789 Care Road, Bangalore, Karnataka 560001',
                'lastUpdated': (datetime.now() - timedelta(minutes=2)).isoformat()
            },
            {
                'id': 4,
                'name': 'Central Hospital',
                'district': 'Chennai',
                'state': 'Tamil Nadu',
                'totalBeds': 180,
                'availableBeds': 25,
                'icuBeds': 25,
                'availableIcu': 2,
                'contact': '+91-44-4567-8901',
                'address': '321 Wellness Lane, Chennai, Tamil Nadu 600001',
                'lastUpdated': (datetime.now() - timedelta(minutes=15)).isoformat()
            },
            {
                'id': 5,
                'name': 'Sunshine Medical',
                'district': 'Hyderabad',
                'state': 'Telangana',
                'totalBeds': 120,
                'availableBeds': 80,
                'icuBeds': 18,
                'availableIcu': 10,
                'contact': '+91-40-5678-9012',
                'address': '654 Healing Street, Hyderabad, Telangana 500001',
                'lastUpdated': (datetime.now() - timedelta(minutes=8)).isoformat()
            }
        ]
        
        if district:
            hospitals = [h for h in hospitals if district.lower() in h['district'].lower()]
        
        # Generate alerts for critical shortages
        for hospital in hospitals:
            if hospital.get('totalBeds', 0) > 0:
                bed_percentage = (hospital['availableBeds'] / hospital['totalBeds']) * 100
                icu_percentage = (hospital['availableIcu'] / hospital['icuBeds']) * 100 if hospital.get('icuBeds', 0) > 0 else 100
                
                if bed_percentage < 15 or icu_percentage < 10:
                    alert_exists = any(a.get('hospitalId') == hospital['id'] for a in alerts_cache)
                    if not alert_exists:
                        alerts_cache.append({
                            'id': len(alerts_cache) + 1,
                            'type': 'bed',
                            'hospitalId': hospital['id'],
                            'hospital': hospital['name'],
                            'district': hospital['district'],
                            'severity': 'critical',
                            'message': f"Critical bed shortage at {hospital['name']} - Only {hospital['availableBeds']} beds available ({bed_percentage:.1f}%)",
                            'timestamp': datetime.now().isoformat()
                        })
        
        return jsonify({
            'success': True,
            'data': hospitals,
            'count': len(hospitals),
            'source': 'mock_data'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/medicines', methods=['GET'])
def get_medicines():
    """Get medicine availability data - Using recall data since shortages API has limited data"""
    try:
        search = request.args.get('search', '')
        limit = int(request.args.get('limit', 20))
        
        medicines = []
        
        # Try to fetch real data from recalls API (more reliable)
        recall_data = get_drug_recalls(search_term=search if search else None, limit=limit)
        
        # Process recall data
        if recall_data and 'results' in recall_data and len(recall_data['results']) > 0:
            print(f"Found {len(recall_data['results'])} recall records")
            
            for idx, recall in enumerate(recall_data['results']):
                # Extract product name from recall
                product_name = recall.get('product_description', 'Unknown Drug')
                
                # Clean up the product name (remove extra details)
                if product_name and product_name != 'Unknown Drug':
                    # Take first line or first 100 chars
                    product_name = product_name.split('\n')[0][:100].strip()
                
                reason = recall.get('reason_for_recall', 'Not specified')
                status = recall.get('status', 'Unknown')
                classification = recall.get('classification', 'Unknown')
                
                # Determine severity based on classification
                # Class I: Most serious (dangerous/death)
                # Class II: May cause temporary health problems  
                # Class III: Not likely to cause health problems
                if classification == 'Class I':
                    availability = 'low'
                    severity = 'critical'
                elif classification == 'Class II':
                    availability = 'moderate'
                    severity = 'moderate'
                else:
                    availability = 'moderate'
                    severity = 'low'
                
                medicine = {
                    'id': idx + 1,
                    'name': product_name,
                    'manufacturer': recall.get('recalling_firm', 'Various'),
                    'category': 'Pharmaceutical',
                    'availability': availability,
                    'warning': f"Recall: {reason[:100]}" if reason != 'Not specified' else None,
                    'recall': True,
                    'recall_status': status,
                    'classification': classification,
                    'recall_date': recall.get('report_date', 'Unknown'),
                    'source': 'openfda_recalls'
                }
                
                medicines.append(medicine)
                
                # Generate alerts for critical recalls
                if classification in ['Class I', 'Class II']:
                    alert_exists = any(
                        a.get('medicine') == product_name and a.get('type') == 'medicine' 
                        for a in alerts_cache
                    )
                    if not alert_exists:
                        alerts_cache.append({
                            'id': len(alerts_cache) + 1,
                            'type': 'medicine',
                            'medicineId': medicine['id'],
                            'medicine': product_name,
                            'severity': severity,
                            'message': f"{product_name} - {classification} RECALL: {reason[:80]}",
                            'timestamp': datetime.now().isoformat()
                        })
        
        # If no real data or not enough, add fallback data
        if len(medicines) < 5:
            fallback_medicines = [
                {
                    'id': len(medicines) + 1,
                    'name': 'Paracetamol 500mg',
                    'manufacturer': 'ABC Pharmaceuticals',
                    'category': 'Analgesic',
                    'availability': 'high',
                    'warning': None,
                    'recall': False,
                    'source': 'fallback'
                },
                {
                    'id': len(medicines) + 2,
                    'name': 'Insulin Glargine 100 Units/mL',
                    'manufacturer': 'Diabetes Care Inc',
                    'category': 'Antidiabetic',
                    'availability': 'low',
                    'warning': 'Supply shortage - limited availability',
                    'recall': False,
                    'source': 'fallback'
                },
                {
                    'id': len(medicines) + 3,
                    'name': 'Amoxicillin 250mg Capsules',
                    'manufacturer': 'Generic Pharma',
                    'category': 'Antibiotic',
                    'availability': 'moderate',
                    'warning': 'Moderate stock levels',
                    'recall': False,
                    'source': 'fallback'
                },
                {
                    'id': len(medicines) + 4,
                    'name': 'Levothyroxine 50mcg Tablets',
                    'manufacturer': 'Hormone Pharma',
                    'category': 'Hormone Replacement',
                    'availability': 'low',
                    'warning': 'Recall issued - contamination detected',
                    'recall': True,
                    'classification': 'Class II',
                    'source': 'fallback'
                },
                {
                    'id': len(medicines) + 5,
                    'name': 'Atorvastatin 20mg Tablets',
                    'manufacturer': 'CardioMed',
                    'category': 'Statin',
                    'availability': 'low',
                    'warning': 'Critical shortage nationwide',
                    'recall': False,
                    'source': 'fallback'
                },
            ]
            
            # Add fallback medicines
            for med in fallback_medicines:
                if search and search.lower() not in med['name'].lower():
                    continue
                medicines.append(med)
                
                # Generate alerts for fallback critical items
                if med.get('availability') == 'low' or med.get('recall'):
                    alert_exists = any(
                        a.get('medicine') == med['name'] and a.get('type') == 'medicine'
                        for a in alerts_cache
                    )
                    if not alert_exists:
                        severity = 'critical' if med.get('recall') or 'critical' in str(med.get('warning', '')).lower() else 'moderate'
                        alerts_cache.append({
                            'id': len(alerts_cache) + 1,
                            'type': 'medicine',
                            'medicineId': med['id'],
                            'medicine': med['name'],
                            'severity': severity,
                            'message': f"{med['name']} - {med.get('warning', 'Low availability')}",
                            'timestamp': datetime.now().isoformat()
                        })
        
        return jsonify({
            'success': True,
            'data': medicines[:limit],
            'count': len(medicines[:limit]),
            'source': 'mixed' if any(m.get('source') == 'openfda_recalls' for m in medicines) else 'fallback'
        })
        
    except Exception as e:
        print(f"Error in /api/medicines: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'data': []
        }), 500

@app.route('/api/alerts', methods=['GET'])
def get_alerts():
    """Get all critical alerts"""
    try:
        filter_type = request.args.get('type', 'all')
        filtered_alerts = alerts_cache.copy()
        
        if filter_type != 'all':
            filtered_alerts = [a for a in filtered_alerts if a.get('type') == filter_type]
        
        filtered_alerts.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
        
        return jsonify({
            'success': True,
            'data': filtered_alerts,
            'count': len(filtered_alerts)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/alerts/critical', methods=['GET'])
def get_critical_alerts():
    """Get only critical severity alerts"""
    try:
        critical_alerts = [a for a in alerts_cache if a.get('severity') == 'critical']
        critical_alerts.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
        
        return jsonify({
            'success': True,
            'data': critical_alerts,
            'count': len(critical_alerts)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/trends/shortages', methods=['GET'])
def get_shortage_trends():
    """Get trending shortage data for charts"""
    try:
        # Generate trend data from alerts cache
        six_months_ago = datetime.now() - timedelta(days=180)
        monthly_counts = {}
        
        for alert in alerts_cache:
            try:
                alert_date = datetime.fromisoformat(alert.get('timestamp', ''))
                if alert_date >= six_months_ago:
                    month_key = alert_date.strftime('%b')
                    monthly_counts[month_key] = monthly_counts.get(month_key, 0) + 1
            except:
                continue
        
        labels = []
        data = []
        for i in range(6):
            month_date = datetime.now() - timedelta(days=30 * (5 - i))
            month_label = month_date.strftime('%b')
            labels.append(month_label)
            data.append(monthly_counts.get(month_label, 0))
        
        # If no real data, provide mock trend
        if sum(data) == 0:
            data = [12, 19, 15, 25, 22, 30]
        
        return jsonify({
            'success': True,
            'data': {'labels': labels, 'data': data},
            'source': 'calculated' if sum(monthly_counts.values()) > 0 else 'mock'
        })
        
    except Exception as e:
        return jsonify({
            'success': True,
            'data': {
                'labels': ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'],
                'data': [12, 19, 15, 25, 22, 30]
            },
            'source': 'mock_fallback'
        })

if __name__ == '__main__':
    app.run(debug=True, port=5000, host='0.0.0.0')