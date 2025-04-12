
# Required imports
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats
import numpy as np

# df is already defined before this runs

# Generated code starts here

import pandas as pd
import numpy as np
from scipy.stats import chi2_contingency
import matplotlib.pyplot as plt
import seaborn as sns


def perform_hypothesis_tests(df):
    """
    Performs hypothesis tests and visualizes the results for specified feature relationships.

    Args:
        df (pd.DataFrame): The input DataFrame.
    """

    def run_chi2_test(feature1, feature2, df, plot=True):
        """
        Performs Chi-Square test and visualizes the results.

        Args:
            feature1 (str): Name of the first feature.
            feature2 (str): Name of the second feature.
            df (pd.DataFrame): The DataFrame.
             plot (bool): Whether to plot the results. Defaults to True.
        """
        contingency_table = pd.crosstab(df[feature1], df[feature2])
        chi2, p, dof, expected = chi2_contingency(contingency_table)

        print(f"Chi-Square Test for {feature1} vs {feature2}:")
        print(f"  Chi2 Statistic: {chi2:.4f}")
        print(f"  P-value: {p:.4f}")
        print(f"  Degrees of Freedom: {dof}")
        print("  Expected Frequencies Table:")
        print(expected)

        if plot:
            plt.figure(figsize=(10, 6))
            sns.heatmap(contingency_table, annot=True, cmap="YlGnBu", fmt="d")
            plt.title(f"Contingency Table: {feature1} vs {feature2}")
            plt.xlabel(feature2)
            plt.ylabel(feature1)
            plt.show()

    # Feature Engineering (Email Domain, Website Domain, Phone Format)
    df['Email Domain'] = df['Email'].str.split('@').str[1]
    df['Website Domain'] = df['Website'].str.replace('www.', '', regex=False).str.split('.').str[0]
    df['Phone Format'] = df['Phone Number'].str.replace(r'[^0-9]', '', regex=True).apply(lambda x: 'Numeric' if x.isdigit() else 'Other')

    # Hypothesis Tests
    run_chi2_test('Subscription Date', 'Country', df)
    run_chi2_test('Company Type', 'Country', df)
    run_chi2_test('Email Domain', 'Country', df)
    run_chi2_test('Website Domain', 'Company Type', df)
    run_chi2_test('Phone Format', 'Country', df)

if __name__ == '__main__':
    # Sample DataFrame (replace with your actual DataFrame)
    data = {
        'Subscription Date': ['2023-01-15', '2023-02-20', '2023-01-10', '2023-03-01', '2023-02-25'],
        'Country': ['USA', 'Canada', 'USA', 'UK', 'Canada'],
        'Company Type': ['Tech', 'Finance', 'Tech', 'Retail', 'Finance'],
        'Email': ['john.doe@gmail.com', 'jane.smith@yahoo.ca', 'peter.jones@company.com', 'lisa.brown@retail.co.uk', 'mark.wilson@finance.ca'],
        'Website': ['www.techco.com', 'www.financeinc.ca', 'www.techsolutions.com', 'www.retailgroup.co.uk', 'www.finance.ca'],
        'Phone Number': ['123-456-7890', '456-789-0123', '789-012-3456', '0123456789', '345-678-9012']
    }
    df = pd.DataFrame(data)

    perform_hypothesis_tests(df.copy())

